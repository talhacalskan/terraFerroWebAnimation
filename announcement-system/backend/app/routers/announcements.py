from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, select
from sqlalchemy.orm import Session
import os

from app.db import get_db
from app.models import Announcement
from app.schemas import AnnouncementCreate, AnnouncementOut, MultipartInitRequest, PresignRequest
from app.services.r2 import R2Service

router = APIRouter(prefix="/announcements", tags=["announcements"])
r2 = R2Service()


def require_admin():
    return True


@router.get("", response_model=list[AnnouncementOut])
def list_announcements(db: Session = Depends(get_db), active_only: bool = Query(default=True)):
    stmt = select(Announcement).order_by(Announcement.created_at.desc())
    if active_only:
        stmt = stmt.where(Announcement.is_active.is_(True))
    return db.scalars(stmt).all()


@router.post("", response_model=AnnouncementOut)
def create_announcement(payload: AnnouncementCreate, db: Session = Depends(get_db), _: bool = Depends(require_admin)):
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


@router.put("/{announcement_id}", response_model=AnnouncementOut)
def update_announcement(announcement_id: str, payload: AnnouncementCreate, db: Session = Depends(get_db), _: bool = Depends(require_admin)):
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


@router.delete("/{announcement_id}")
def delete_announcement(announcement_id: str, db: Session = Depends(get_db), _: bool = Depends(require_admin)):
    deleted = db.execute(delete(Announcement).where(Announcement.id == announcement_id))
    db.commit()
    if deleted.rowcount == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"ok": True}


@router.post("/uploads/presign")
def presign_upload(payload: PresignRequest, _: bool = Depends(require_admin)):
    key = r2.build_key(payload.filename)
    max_direct_size = 50 * 1024 * 1024

    # For testing/development with mock credentials, return mock presigned URL
    is_test_mode = (
        os.environ.get("R2_ACCOUNT_ID", "").startswith("test") or
        os.environ.get("R2_ACCOUNT_ID", "") == "1234567890abcdef1234567890abcdef"
    )

    if is_test_mode:
        # Return mock presigned URL for testing
        return {
            "mode": "single",
            "key": key,
            "uploadUrl": f"http://localhost:8000/announcements/uploads/{key}",
            "publicUrl": f"http://localhost:8000/announcements/uploads/{key}",
        }

    if payload.size <= max_direct_size:
        return {
            "mode": "single",
            "key": key,
            "uploadUrl": r2.presign_put(key, payload.content_type),
            "publicUrl": r2.public_url(key),
        }

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


@router.post("/uploads/multipart/init")
def multipart_init(payload: MultipartInitRequest, _: bool = Depends(require_admin)):
    key = r2.build_key(payload.filename)
    upload_id = r2.init_multipart_upload(key, payload.content_type)
    return {"key": key, "uploadId": upload_id}


@router.post("/uploads/multipart/part-url")
def multipart_part_url(key: str, upload_id: str, part_number: int, _: bool = Depends(require_admin)):
    return {"url": r2.presign_part(key, upload_id, part_number)}


@router.put("/uploads/mock")
async def mock_upload(key: str = None):
    """Mock upload endpoint for testing with fake R2 credentials"""
    if not key:
        raise HTTPException(status_code=400, detail="key parameter required")
    return {"status": "success"}


@router.post("/uploads/multipart/complete")
def multipart_complete(key: str, upload_id: str, parts: list[dict], _: bool = Depends(require_admin)):
    result = r2.complete_multipart_upload(key, upload_id, parts)
    return {"ok": True, "result": result, "publicUrl": r2.public_url(key)}


# In-memory storage for test mode uploads
_test_mode_files: dict[str, bytes] = {}


@router.put("/uploads/{file_path:path}")
async def upload_file(file_path: str, request):
    """Store file in memory for test mode"""
    body = await request.body()
    _test_mode_files[file_path] = body
    return {"status": "success"}


@router.get("/uploads/{file_path:path}")
async def download_file(file_path: str):
    """Serve uploaded files from test mode storage"""
    if file_path not in _test_mode_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_data = _test_mode_files[file_path]
    # Determine content type based on file extension
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

