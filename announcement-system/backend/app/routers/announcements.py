from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import delete, select
from sqlalchemy.orm import Session
import os

from app.db import get_db
from app.models import Announcement
from app.schemas import AnnouncementCreate, AnnouncementOut, MultipartInitRequest, PresignRequest
from app.services.r2 import R2Service
from app.core.config import get_settings

# YENİ GÜVENLİK GÖREVLİMİZİ İÇERİ ALIYORUZ
from app.core.security import verify_admin

router = APIRouter(prefix="/announcements", tags=["announcements"])
settings = get_settings()
r2 = R2Service()

# DİKKAT: Eski sahte 'require_admin' fonksiyonunu sildik.


# GET İşlemi: Kilit YOK (Siteye giren herkes duyuruları görebilmeli)
@router.get("", response_model=list[AnnouncementOut])
def list_announcements(db: Session = Depends(get_db), active_only: bool = Query(default=True)):
    stmt = select(Announcement).order_by(Announcement.created_at.desc())
    if active_only:
        stmt = stmt.where(Announcement.is_active.is_(True))
    return db.scalars(stmt).all()


# POST İşlemi: Kilit VAR (Sadece Supabase mührü olan admin ekleyebilir)
@router.post("", response_model=AnnouncementOut)
def create_announcement(
    payload: AnnouncementCreate, 
    db: Session = Depends(get_db), 
    admin_bilgisi: dict = Depends(verify_admin)  # KİLİT
):
    announcement = Announcement(
        title=payload.title,
        content=payload.content,
        media_data=[item.model_dump() for item in payload.media_data],
        is_active=payload.is_active,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


# PUT İşlemi: Kilit VAR 
@router.put("/{announcement_id}", response_model=AnnouncementOut)
def update_announcement(
    announcement_id: str, 
    payload: AnnouncementCreate, 
    db: Session = Depends(get_db), 
    admin_bilgisi: dict = Depends(verify_admin)  # KİLİT
):
    stmt = select(Announcement).where(Announcement.id == announcement_id)
    announcement = db.scalars(stmt).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    announcement.title = payload.title
    announcement.content = payload.content
    announcement.media_data = [item.model_dump() for item in payload.media_data]
    announcement.is_active = payload.is_active
    
    db.commit()
    db.refresh(announcement)
    return announcement


# DELETE İşlemi: Kilit VAR
@router.delete("/{announcement_id}")
def delete_announcement(
    announcement_id: str, 
    db: Session = Depends(get_db), 
    admin_bilgisi: dict = Depends(verify_admin)  # KİLİT
):
    deleted = db.execute(delete(Announcement).where(Announcement.id == announcement_id))
    db.commit()
    if deleted.rowcount == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"ok": True}


# UPLOAD İşlemleri (R2): Kilit VAR (Kimse senin R2 depona çöp dosya atamasın)
@router.post("/uploads/presign")
def presign_upload(payload: PresignRequest, admin_bilgisi: dict = Depends(verify_admin)):
    key = r2.build_key(payload.filename)
    max_direct_size = 50 * 1024 * 1024  # 50MB

    try:
        # Eğer dosya boyutu küçükse (tek seferde yükleme)
        if payload.size <= max_direct_size:
            # BURASI KRİTİK: r2.presign_put gerçek S3 yükleme linkini (cloudflarestorage.com) üretir
            upload_url = r2.presign_put(key, payload.content_type)
            
            return {
                "mode": "single",
                "key": key,
                "uploadUrl": upload_url,
                "publicUrl": r2.public_url(key), # Bu sadece görüntüleme için
            }

        # Büyük dosyalar için Multipart (Video vb.)
        upload_id = r2.init_multipart_upload(key, payload.content_type)
        part_urls = [
            {"partNumber": part_number, "url": r2.presign_part(key, upload_id, part_number)}
            for part_number in range(1, 11)
        ]
        return {
            "mode": "multipart",
            "key": key,
            "uploadId": upload_id,
            "partUrls": part_urls,
            "publicUrl": r2.public_url(key),
        }
        
    except Exception as e:
        # Hata olursa terminale çok net bir mesaj basalım
        print(f"!!! R2 HATASI: Bilet oluşturulamadı: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Cloudflare bağlantı hatası: {str(e)}. Lütfen R2 API anahtarlarınızı kontrol edin."
        )


@router.post("/uploads/multipart/init")
def multipart_init(payload: MultipartInitRequest, admin_bilgisi: dict = Depends(verify_admin)):
    key = r2.build_key(payload.filename)
    upload_id = r2.init_multipart_upload(key, payload.content_type)
    return {"key": key, "uploadId": upload_id}


@router.post("/uploads/multipart/part-url")
def multipart_part_url(key: str, upload_id: str, part_number: int, admin_bilgisi: dict = Depends(verify_admin)):
    return {"url": r2.presign_part(key, upload_id, part_number)}


@router.post("/uploads/multipart/complete")
def multipart_complete(key: str, upload_id: str, parts: list[dict], admin_bilgisi: dict = Depends(verify_admin)):
    result = r2.complete_multipart_upload(key, upload_id, parts)
    return {"ok": True, "result": result, "publicUrl": r2.public_url(key)}


# MOCK / TEST Rotaları (İsteğe bağlı olarak bunlara da kilit eklenebilir ama şu an için test ortamı olduğundan bırakabilirsin)
@router.put("/uploads/mock")
async def mock_upload(key: str = None):
    if not key:
        raise HTTPException(status_code=400, detail="key parameter required")
    return {"status": "success"}

_test_mode_files: dict[str, bytes] = {}

@router.put("/uploads/{file_path:path}")
async def upload_file(file_path: str, request: Request):
    body = await request.body()
    _test_mode_files[file_path] = body
    return {"status": "success"}

@router.get("/uploads/{file_path:path}")
async def download_file(file_path: str):
    if file_path not in _test_mode_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_data = _test_mode_files[file_path]
    content_type = "application/octet-stream"
    if file_path.endswith((".jpg", ".jpeg")):
        content_type = "image/jpeg"
    elif file_path.endswith(".png"):
        content_type = "image/png"
    elif file_path.endswith(".gif"):
        content_type = "image/gif"
    elif file_path.endswith(".webp"):
        content_type = "image/webp"
    elif file_path.endswith((".mp4", ".webm")):
        content_type = "video/mp4" if file_path.endswith(".mp4") else "video/webm"
    
    from fastapi.responses import Response
    return Response(content=file_data, media_type=content_type)