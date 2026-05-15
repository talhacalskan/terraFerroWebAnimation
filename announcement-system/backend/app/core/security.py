import os
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

# Fotoğraftaki 'Discovery URL' kutusunda yazan linki buraya yapıştırıyoruz
# Genellikle sonu '.json' ile biter, fotoğraftakine göre tam halini yazdım:
JWKS_URL = "https://ourbidaufixksuzzymob.supabase.co/auth/v1/.well-known/jwks.json"

# Bu istemci, anahtarları Supabase'den otomatik olarak çeker ve hafızasında tutar
jwks_client = jwt.PyJWKClient(JWKS_URL)

def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    try:
        # 1. Gelen mühre uygun anahtarı linkten otomatik olarak bul
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # 2. Token'ı o anahtarla doğrula (ES256 algoritmasıyla)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            audience="authenticated"
        )
        
        email = payload.get("email")
        allowed_emails = ["bilgisayarciapo38@gmail.com", "admin@terraferro.com"]
        
        if email not in allowed_emails:
            raise HTTPException(status_code=403, detail="Erişim reddedildi: Yetkisiz e-posta.")
            
        return payload
        
    except Exception as e:
        # Hata olursa terminalde nedenini görebileceğiz
        print(f"!!! GÜVENLİK KRİZİ: {str(e)}")
        raise HTTPException(status_code=401, detail="Kimlik doğrulaması başarısız oldu.")