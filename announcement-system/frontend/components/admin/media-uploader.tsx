"use client";

import { useRef, useState } from "react";
import { CloudUpload, ImagePlus, Video, Trash2 } from "lucide-react";

import {
  completeMultipartUpload,
  getMultipartPartUrl,
  getPresignedUpload,
} from "../../lib/api";

export type MediaDraft = {
  url: string;
  type: "image" | "video";
  mimeType: string;
  posterUrl?: string;
  thumbUrl?: string;
  filename?: string;
};

type Props = {
  media: MediaDraft[];
  onChange: (items: MediaDraft[]) => void;
};

export function MediaUploader({ media, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFiles(files: FileList | File[]) {
    const nextMedia = [...media];
    setUploadError(null);
    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Validate file size
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (file.size > maxSize) {
          throw new Error(
            `Dosya çok büyük: ${(file.size / 1024 / 1024).toFixed(2)}MB (Max: 500MB)`,
          );
        }

        try {
          const session = await getPresignedUpload({
            filename: file.name,
            content_type: file.type,
            size: file.size,
          });

          if (session.mode === "single") {
            const uploadResponse = await fetch(session.uploadUrl, {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file,
            });

            if (!uploadResponse.ok) {
              throw new Error(
                `R2 upload başarısız: ${uploadResponse.status} ${uploadResponse.statusText}`,
              );
            }

            nextMedia.push({
              url: session.publicUrl,
              type: file.type.startsWith("video/") ? "video" : "image",
              mimeType: file.type,
              filename: file.name,
            });
          } else {
            const partSize = 10 * 1024 * 1024;
            const parts: Array<{ ETag: string; PartNumber: number }> = [];
            let partNumber = 1;

            for (let offset = 0; offset < file.size; offset += partSize) {
              const chunk = file.slice(offset, offset + partSize);
              const { url } = await getMultipartPartUrl({
                key: session.key,
                uploadId: session.uploadId,
                part_number: partNumber,
              });

              const response = await fetch(url, {
                method: "PUT",
                body: chunk,
              });

              if (!response.ok) {
                throw new Error(
                  `Multipart upload başarısız: Parça ${partNumber}: ${response.status}`,
                );
              }

              parts.push({
                ETag: response.headers.get("etag") || `part-${partNumber}`,
                PartNumber: partNumber,
              });
              partNumber += 1;
            }

            await completeMultipartUpload({
              key: session.key,
              uploadId: session.uploadId,
              parts,
            });

            nextMedia.push({
              url: session.publicUrl,
              type: file.type.startsWith("video/") ? "video" : "image",
              mimeType: file.type,
              filename: file.name,
            });
          }
        } catch (fileError) {
          const errorMsg =
            fileError instanceof Error
              ? fileError.message
              : `${file.name} yüklenemedi`;
          console.error(`Upload error for ${file.name}:`, fileError);
          throw new Error(errorMsg);
        }
      }

      onChange(nextMedia);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Medya yüklenemedi";
      setUploadError(errorMsg);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={async (event) => {
        event.preventDefault();
        setDragging(false);
        await uploadFiles(event.dataTransfer.files);
      }}
      className={[
        "rounded-3xl border border-dashed p-6 transition",
        dragging
          ? "border-cyan-300 bg-cyan-300/10"
          : "border-white/10 bg-black/20 hover:border-white/20",
      ].join(" ")}
    >
      {uploadError && (
        <div className="mb-4 rounded-2xl border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-200">
          {uploadError}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={async (event) => {
          if (event.target.files) {
            await uploadFiles(event.target.files);
          }
        }}
      />

      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center transition hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <CloudUpload
          className={`h-7 w-7 text-cyan-300 ${isUploading ? "animate-pulse" : ""}`}
        />
        <div>
          <p className="text-sm font-medium text-white/80">
            {isUploading ? "Yükleniyor..." : "Fotoğraf veya video yükle"}
          </p>
          <p className="mt-1 text-xs text-white/45">
            {isUploading ? "Lütfen bekleyin..." : "Sürükle-bırak veya tıkla"}
          </p>
        </div>
        <div className="mt-1 flex items-center gap-4 text-xs text-white/45">
          <span className="inline-flex items-center gap-2">
            <ImagePlus className="h-4 w-4" /> Resim
          </span>
          <span className="inline-flex items-center gap-2">
            <Video className="h-4 w-4" /> Video
          </span>
        </div>
      </button>
    </div>
  );
}
