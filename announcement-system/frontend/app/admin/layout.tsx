"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

const ADMIN_EMAILS = ["bilgisayarciapo38@gmail.com", "admin@terraferro.com"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      } else if (
        !session.user.email ||
        !ADMIN_EMAILS.includes(session.user.email)
      ) {
        await supabase.auth.signOut();
        router.push("/login");
      } else {
        setUserEmail(session.user.email);
        setAuthorized(true);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-4 text-emerald-500">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium tracking-widest uppercase">
          Güvenlik kontrolü...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-emerald-500/30">
      {/* --- ADMIN NAVIGATION BAR --- */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Sol Kısım: Logo ve Menü */}
            <div className="flex items-center gap-8">
              <Link
                href="/admin"
                className="text-lg font-bold tracking-tighter text-white hover:text-emerald-400 transition-colors"
              >
                TERRA <span className="text-emerald-500">FERRO</span> CMS
              </Link>

              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/admin"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === "/admin" ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/announcements"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname.includes("/admin/announcements") ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                >
                  Duyurular
                </Link>
              </div>
            </div>

            {/* Sağ Kısım: Kullanıcı ve Çıkış */}
            <div className="flex items-center gap-6">
              <div className="hidden lg:block text-right">
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
                  Yönetici
                </p>
                <p className="text-xs text-white/60">{userEmail}</p>
              </div>

              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg shadow-red-500/5"
              >
                <span className="text-sm font-semibold">Çıkış Yap</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- ANA İÇERİK ALANI --- */}
      <main className="mx-auto max-w-7xl p-6 sm:p-8">{children}</main>
    </div>
  );
}
