from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db import Base, engine
from app.routers.announcements import router as announcements_router
import app.models  # Bu satır tabloların algılanması için çok önemli!

settings = get_settings()

# 1. Yaşam Döngüsü (Lifespan) Yönetimi - Yeni ve Modern Yöntem
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Sunucu başlarken çalışacak işlemler (Startup)
    print("Veritabanına bağlanılıyor ve tablolar kontrol ediliyor...")
    Base.metadata.create_all(bind=engine)
    print("Tablolar başarıyla oluşturuldu/doğrulandı!")
    
    yield  # Sunucu bu satırda çalışmaya devam eder
    
    # Sunucu kapanırken çalışacak işlemler (Shutdown)
    print("Sunucu kapatılıyor, bağlantılar kesiliyor...")

# 2. FastAPI Uygulamasını Lifespan ile Başlatmak
app = FastAPI(
    title="Terra Ferro Announcements API", 
    lifespan=lifespan
)

# 3. Güvenlik (CORS) Ayarları
cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5501",
    "http://127.0.0.1:5501",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Rotaları (Endpointleri) Bağlamak
app.include_router(announcements_router)

@app.get("/health")
def health():
    return {"ok": True, "message": "Terra Ferro Backend is running!"}