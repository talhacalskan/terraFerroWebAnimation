"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronRight, Play, Trash2, Edit2 } from "lucide-react";

import type { AnnouncementRecord } from "../../lib/api";

type Props = {
  items: AnnouncementRecord[];
  onEdit?: (item: AnnouncementRecord) => void;
  onDelete?: (id: string) => void;
};

function MediaRenderer({ item }: { item: AnnouncementRecord }) {
  const primary = item.media_data?.[0];

  if (!primary) {
    return (
      <div className="aspect-video rounded-3xl bg-gradient-to-br from-white/10 to-white/5" />
    );
  }

  if (primary.type === "video") {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30">
        <video
          controls
          poster={primary.poster_url}
          className="aspect-video w-full object-cover"
        >
          <source src={primary.url} />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
          <Play className="mr-1 inline-block h-3.5 w-3.5" /> Video
        </div>
      </div>
    );
  }

  if (item.media_data.length === 1) {
    return (
      <img
        src={primary.url}
        alt={item.title}
        className="aspect-video w-full rounded-3xl object-cover"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 rounded-3xl">
      {item.media_data.slice(0, 4).map((media) => (
        <img
          key={media.url}
          src={media.url}
          alt={item.title}
          className="h-36 w-full rounded-2xl object-cover"
        />
      ))}
    </div>
  );
}

function readPreview(content: string) {
  const plain = content.replace(/^#+\s+/gm, "").replace(/\*\*/g, "");
  return plain.length > 180 ? `${plain.slice(0, 180)}...` : plain;
}

export function AnnouncementFeed({ items, onEdit, onDelete }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between text-xs text-white/45">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(item.created_at).toLocaleDateString("tr-TR")}
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                Aktif
              </span>
            </div>

            <MediaRenderer item={item} />

            <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">
              {item.title}
            </h3>
            <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/65">
              {readPreview(item.content)}
            </p>

            <button
              onClick={() => setActiveId(item.id)}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
            >
              Devamını Oku
              <ChevronRight className="h-4 w-4" />
            </button>

            {(onEdit || onDelete) && (
              <div className="mt-4 flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 transition hover:border-blue-400/40 hover:bg-blue-500/20 hover:text-blue-200"
                  >
                    <Edit2 className="h-4 w-4" />
                    Düzenle
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `"${item.title}" duyurusunu silmek istediğinizden emin misiniz?`,
                        )
                      ) {
                        onDelete(item.id);
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:border-red-400/40 hover:bg-red-500/20 hover:text-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    Sil
                  </button>
                )}
              </div>
            )}
          </motion.article>
        ))}
      </div>

      <AnimatePresence>
        {activeId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
            onClick={() => setActiveId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-4xl overflow-hidden rounded-[30px] border border-white/10 bg-[#0a0a0a] shadow-[0_24px_120px_rgba(0,0,0,0.5)]"
            >
              {items
                .filter((item) => item.id === activeId)
                .map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-6 p-5 md:p-7 lg:grid-cols-[1.1fr_0.9fr]"
                  >
                    <div>
                      <h3 className="text-3xl font-semibold tracking-tight text-white">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm text-white/50">
                        {new Date(item.created_at).toLocaleString("tr-TR")}
                      </p>
                      <div className="mt-6 space-y-4 text-sm leading-7 text-white/75">
                        {item.content
                          .split("\n")
                          .map((paragraph, paragraphIndex) => (
                            <p key={paragraphIndex}>{paragraph}</p>
                          ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {item.media_data.map((media) =>
                        media.type === "video" ? (
                          <video
                            key={media.url}
                            controls
                            poster={media.poster_url}
                            className="w-full rounded-3xl border border-white/10"
                          >
                            <source src={media.url} />
                          </video>
                        ) : (
                          <img
                            key={media.url}
                            src={media.url}
                            alt={item.title}
                            className="w-full rounded-3xl border border-white/10 object-cover"
                          />
                        ),
                      )}
                    </div>
                  </div>
                ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
