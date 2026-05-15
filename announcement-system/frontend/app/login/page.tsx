"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Şifre ile giriş yapıyoruz
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Giriş başarısız: Bilgilerinizi kontrol edin.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Admin Girişi
        </h1>
        <p className="text-neutral-400 mb-8 text-sm">
          Terra Ferro Tech yönetim paneline erişmek için yetkili bilgilerinizi
          girin.
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-widest mb-2">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
              placeholder="admin@terraferro.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-widest mb-2">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "Kontrol Ediliyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
