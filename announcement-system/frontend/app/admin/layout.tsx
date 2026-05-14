"use client";

import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#070707] text-white">
      <aside className="w-64 border-r border-white/5 p-6">
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">
            Admin
          </h3>
          <h2 className="mt-2 text-lg font-semibold">Yönetim</h2>
        </div>

        <nav className="flex flex-col gap-2">
          <Link
            href="/admin/announcements"
            className="rounded-md px-3 py-2 text-sm hover:bg-white/5"
          >
            Duyurular
          </Link>
          <Link
            href="#"
            className="rounded-md px-3 py-2 text-sm text-white/60 hover:bg-white/5"
          >
            Kullanıcılar
          </Link>
          <Link
            href="#"
            className="rounded-md px-3 py-2 text-sm text-white/60 hover:bg-white/5"
          >
            Ayarlar
          </Link>
        </nav>

        <div className="mt-8 text-xs text-white/60">Oturum: admin</div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
