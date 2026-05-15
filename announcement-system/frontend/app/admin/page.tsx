"use client";

import Link from "next/link";

export default function AdminIndexPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Yönetim Paneli</h1>
      <p className="mb-6 text-sm text-white/60">Aşağıdan bir bölüm seçin:</p>

      <div className="grid gap-3">
        <Link
          href="/admin/announcements"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10"
        >
          Duyurular
        </Link>
      </div>
    </div>
  );
}
