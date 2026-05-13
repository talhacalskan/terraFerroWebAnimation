"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Save, Upload, X } from "lucide-react";

import { MediaUploader, MediaDraft } from "./media-uploader";
import { RichEditor } from "./rich-editor";
import {
  AnnouncementRecord,
  createAnnouncement,
  updateAnnouncement,
} from "../../lib/api";

type Props = {
  onCreated?: (item: AnnouncementRecord) => void;
  editingItem?: AnnouncementRecord | null;
  onEditingChange?: (item: AnnouncementRecord | null) => void;
};

export function AnnouncementCMS({
  onCreated,
  editingItem,
  onEditingChange,
}: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(
    "# Yeni Duyuru\n\nMetni buraya yazın.",
  );
  const [isActive, setIsActive] = useState(true);
  const [media, setMedia] = useState<MediaDraft[]>([]);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null,
  );

  // When editingItem changes, populate form
  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setContent(editingItem.content);
      setIsActive(editingItem.is_active);
      setMedia(
        editingItem.media_data.map((m) => ({
          url: m.url,
          type: m.type,
          mimeType: m.mime_type,
          posterUrl: m.poster_url,
          thumbUrl: m.thumb_url,
          filename: m.filename,
        })),
      );
      setStatusMessage(null);
      setStatusType(null);
    } else {
      resetForm();
    }
  }, [editingItem]);

  function resetForm() {
    setTitle("");
    setContent("# Yeni Duyuru\n\nMetni buraya yazın.");
    setIsActive(true);
    setMedia([]);
    setStatusMessage(null);
    setStatusType(null);
  }

  const canSubmit = useMemo(
    () => title.trim().length > 2 && content.trim().length > 0,
    [title, content],
  );

  async function handleSave() {
    if (!canSubmit) return;
    setBusy(true);
    setStatusMessage(null);
    setStatusType(null);
    try {
      const payload = {
        title,
        content,
        media_data: media.map((item) => ({
          url: item.url,
          type: item.type,
          mime_type: item.mimeType,
          poster_url: item.posterUrl,
          thumb_url: item.thumbUrl,
          filename: item.filename,
        })),
        is_active: isActive,
      };

      if (editingItem) {
        // Update existing
        const updated = await updateAnnouncement(editingItem.id, payload);
        onCreated?.(updated);
        onEditingChange?.(null);
        setStatusType("success");
        setStatusMessage("Duyuru başarıyla güncellendi.");
        resetForm();
      } else {
        // Create new
        const created = await createAnnouncement(payload);
        onCreated?.(created);
        setStatusType("success");
        setStatusMessage("Duyuru başarıyla kaydedildi.");
        resetForm();
      }
    } catch (err) {
      setStatusType("error");
      setStatusMessage(
        err instanceof Error ? err.message : "İşlem başarısız oldu.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="announcement-cms-form mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[1.35fr_0.9fr] md:px-8"
    >
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">
              Admin CMS
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {editingItem ? "Duyuru Düzenle" : "Duyuru Oluştur"}
            </h2>
          </div>
          <div className="flex gap-2">
            {editingItem && (
              <button
                onClick={() => onEditingChange?.(null)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-red-400/40 hover:bg-red-500/10"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {!editingItem && (
              <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-400/40 hover:bg-cyan-400/10">
                <Plus className="mr-2 inline-block h-4 w-4" />
                Yeni
              </button>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {statusMessage && statusType ? (
            <div
              className={`rounded-2xl border p-3 text-sm ${
                statusType === "success"
                  ? "border-emerald-300/30 bg-emerald-500/10 text-emerald-200"
                  : "border-red-300/30 bg-red-500/10 text-red-200"
              }`}
            >
              {statusMessage}
            </div>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm text-white/60">Başlık</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
              placeholder="Duyuru başlığı"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-white/60">İçerik</span>
            <RichEditor value={content} onChange={setContent} />
          </label>

          <MediaUploader media={media} onChange={setMedia} />

          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between">
            <label className="flex items-center gap-3 text-sm text-white/75">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
              Yayında olsun
            </label>

            <button
              disabled={!canSubmit || busy}
              onClick={handleSave}
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="mr-2 h-4 w-4" />
              {busy
                ? editingItem
                  ? "Güncelleniyor..."
                  : "Kaydediliyor..."
                : editingItem
                  ? "Güncelle"
                  : "Kaydet"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="mb-4 text-sm font-medium text-white/70">
            Medya Önizleme
          </p>
          <div className="grid gap-3">
            {media.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-sm text-white/45">
                Fotoğraf veya video eklenmedi.
              </div>
            ) : (
              media.map((item) => (
                <div
                  key={item.url}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.filename || "media"}
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      controls
                      className="h-44 w-full object-cover"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="mb-3 text-sm font-medium text-white/70">Akış Notu</p>
          <p className="text-sm leading-6 text-white/55">
            Yüklenen medya önce R2'ya gider, ardından duyuru kaydına public URL
            olarak eklenir. Büyük videolar multipart upload ile parçalı
            gönderilir.
          </p>
          <Upload className="mt-5 h-6 w-6 text-cyan-300/80" />
        </div>
      </div>
    </motion.div>
  );
}
