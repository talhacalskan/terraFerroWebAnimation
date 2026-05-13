"use client";

import { useEffect, useState } from "react";

import { AnnouncementCMS } from "../../../components/admin/announcement-cms";
import { AnnouncementFeed } from "../../../components/public/announcement-feed";
import {
  AnnouncementRecord,
  fetchAnnouncements,
  deleteAnnouncement,
} from "../../../lib/api";

function AdminListSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[28px] border border-white/10 bg-white/5 p-4"
        >
          <div className="h-4 w-28 rounded bg-white/10" />
          <div className="mt-4 aspect-video rounded-3xl bg-white/10" />
          <div className="mt-4 h-5 w-3/4 rounded bg-white/10" />
          <div className="mt-2 h-4 w-full rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<AnnouncementRecord | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAnnouncements({ activeOnly: false });
        if (active) {
          setItems(data);
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

    load();
    return () => {
      active = false;
    };
  }, []);

  function handleCreated(item: AnnouncementRecord) {
    if (editingItem) {
      // Replace the edited item
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    } else {
      // Add new item
      setItems((prev) => [item, ...prev]);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAnnouncement(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Duyuru silinemedi.");
    }
  }

  function handleEdit(item: AnnouncementRecord) {
    setEditingItem(item);
    // Scroll to form
    setTimeout(() => {
      document
        .querySelector(".announcement-cms-form")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <AnnouncementCMS
        onCreated={handleCreated}
        editingItem={editingItem}
        onEditingChange={setEditingItem}
      />

      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Kayıtlı Duyurular
          </h2>
          <p className="text-sm text-white/60">Toplam: {items.length}</p>
        </div>

        {loading ? <AdminListSkeleton /> : null}

        {!loading && error ? (
          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
            Henüz bir duyuru bulunmuyor.
          </div>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <AnnouncementFeed
            items={items}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : null}
      </section>
    </main>
  );
}
