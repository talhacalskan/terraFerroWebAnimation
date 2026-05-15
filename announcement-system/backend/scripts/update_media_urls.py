"""Replace localhost media URL base with configured R2_PUBLIC_BASE_URL.

Usage:
  - Set R2_PUBLIC_BASE_URL in .env (e.g. https://cdn.example.com)
  - Activate the project's venv and run:
      python scripts/update_media_urls.py

This script updates announcements.media_data entries in-place.
"""
from app.core.config import get_settings
from app.db import SessionLocal
from app.models import Announcement
from sqlalchemy import select


def main():
    settings = get_settings()
    public_base = getattr(settings, "R2_PUBLIC_BASE_URL", None)
    if not public_base:
        print("R2_PUBLIC_BASE_URL is not set in settings (.env). Aborting.")
        return

    old_base = "http://localhost:8000"
    if public_base.rstrip("/") == old_base.rstrip("/"):
        print("R2_PUBLIC_BASE_URL equals localhost; no changes needed.")
        return

    session = SessionLocal()
    try:
        stmt = select(Announcement)
        rows = session.scalars(stmt).all()
        updated = 0
        for ann in rows:
            changed = False
            new_media = []
            for item in ann.media_data:
                url = item.get("url")
                if isinstance(url, str) and url.startswith(old_base):
                    new_url = url.replace(old_base.rstrip("/"), public_base.rstrip("/"))
                    item["url"] = new_url
                    changed = True
                new_media.append(item)

            if changed:
                ann.media_data = new_media
                session.add(ann)
                updated += 1

        if updated > 0:
            session.commit()
            print(f"Updated {updated} announcement(s) media URLs to use {public_base}")
        else:
            print("No announcements required updates.")
    finally:
        session.close()


if __name__ == "__main__":
    main()
