"use client";

import { useEffect, useState } from "react";

import { AnnouncementFeed } from "../../components/public/announcement-feed";
import { AnnouncementRecord, fetchAnnouncements } from "../../lib/api";

function LoadingSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.32)]"
        >
          <div className="mb-4 h-4 w-32 rounded bg-white/10" />
          <div className="aspect-video rounded-3xl bg-white/10" />
          <div className="mt-5 h-6 w-3/4 rounded bg-white/10" />
          <div className="mt-3 h-4 w-full rounded bg-white/10" />
          <div className="mt-2 h-4 w-5/6 rounded bg-white/10" />
          <div className="mt-6 h-10 w-32 rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAnnouncements() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAnnouncements();
        if (active) {
          setAnnouncements(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Duyurular yüklenirken bir hata oluştu.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAnnouncements();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-cyan-300/80">
              Terra Ferro Tech
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Duyurular
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-white/60 md:text-right">
            Glassmorphism kartlar, akıcı motion geçişleri ve medya odaklı modern
            bir akış.
          </p>
        </div>
        {loading ? <LoadingSkeleton /> : null}

        {!loading && error ? (
          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {!loading && !error && announcements.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
            Henüz bir duyuru bulunmuyor.
          </div>
        ) : null}

        {!loading && !error && announcements.length > 0 ? (
          <AnnouncementFeed items={announcements} />
        ) : null}
      </section>
    </main>
  );
}
