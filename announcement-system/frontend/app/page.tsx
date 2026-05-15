"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { fetchAnnouncements, AnnouncementRecord } from "../lib/api"; // paylaştığın dosya
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ScrollToPlugin } from "gsap/dist/ScrollToPlugin";
import * as THREE from "three";

export default function HomePage() {
  const [lang, setLang] = useState<"en" | "tr" | "sq">("en");
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const crystalRef = useRef<THREE.Mesh | null>(null);

  // --- ÇEVİRİ VERİLERİ (Senin index.html'den) ---
  const t = {
    en: {
      "hero-title": "TERRA FERRO",
      "hero-tagline": "Forging the Present, Coding the Future",
      "hero-desc":
        "We supply the industry's most durable agricultural attachments today, while engineering the autonomous drones of tomorrow.",
      "nav-home": "Biosphere",
      "nav-hw": "Hardware",
      "nav-ann": "Announcements",
      "nav-ft": "Future_Protocol",
    },
    tr: {
      "hero-title": "TERRA FERRO",
      "hero-tagline": "Bugünü Dövüyoruz, Geleceği Kodluyoruz",
      "hero-desc":
        "Bugün endüstrinin en dayanıklı tarım ataçmanlarını sağlarken, yarının otonom dronlarını tasarlıyoruz.",
      "nav-home": "Biyosfer",
      "nav-hw": "Donanım",
      "nav-ann": "Duyurular",
      "nav-ft": "Gelecek_Protokolü",
    },
    sq: {
      "hero-title": "TERRA FERRO",
      "hero-tagline": "Farkëtimi i të Tashmes, Kodimi i së Ardhmes",
      "hero-desc":
        "Ne furnizojmë sot bashkëngjitjet bujqësore më të qëndrueshme të industrisë, ndërkohë që inxhinierojmë dronët autonomë.",
      "nav-home": "Biosfera",
      "nav-hw": "Hardueri",
      "nav-ann": "Njoftime",
      "nav-ft": "Protokolli_Ardhshëm",
    },
  };

  useEffect(() => {
    // 1. Duyuruları Getir (Senin API fonksiyonunla)
    fetchAnnouncements({ activeOnly: true })
      .then(setAnnouncements)
      .catch((err: any) => console.error("Duyuru çekme hatası:", err));

    // 2. Three.js Kristal Animasyonu
    if (typeof window !== "undefined") {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document
        .getElementById("canvas-container")
        ?.appendChild(renderer.domElement);

      const geometry = new THREE.OctahedronGeometry(3, 0);
      const material = new THREE.MeshBasicMaterial({
        color: 0x1f4d1f,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
      });
      const crystal = new THREE.Mesh(geometry, material);
      crystalRef.current = crystal;
      scene.add(crystal);
      camera.position.z = 10;

      const animate = () => {
        requestAnimationFrame(animate);
        crystal.rotation.y += 0.002;
        crystal.rotation.x += 0.001;
        renderer.render(scene, camera);
      };
      animate();

      // 3. GSAP Animasyonları
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
      gsap.to("#scroll-bar", {
        height: "100%",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // Preloader'ı kaldır
      setTimeout(
        () => document.getElementById("preloader")?.classList.add("hidden"),
        1000,
      );
    }
  }, []);

  return (
    <main className="relative bg-white text-zinc-900 overflow-x-hidden font-sans">
      {/* PRELOADER */}
      <div
        id="preloader"
        className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-opacity duration-1000"
      >
        <div className="w-16 h-16 border-4 border-[#1f4d1f] border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 font-mono text-[10px] tracking-widest text-[#1f4d1f]">
          SYSTEM INITIALIZING...
        </div>
      </div>

      <div
        id="canvas-container"
        className="fixed inset-0 z-0 pointer-events-none opacity-40"
      ></div>
      <div
        id="scroll-path"
        className="fixed left-5 top-0 w-[1px] h-full bg-zinc-100 z-50 hidden md:block"
      >
        <div
          id="scroll-bar"
          className="w-full bg-[#1f4d1f] shadow-[0_0_10px_#1f4d1f]"
        ></div>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full p-6 md:p-10 z-[100] flex justify-between items-center bg-white/60 backdrop-blur-md">
        <div className="text-xl font-bold tracking-tighter">
          <span className="text-[#1f4d1f]">TERRA</span>FERRO
          <span className="text-[#1f4d1f] text-[10px] ml-1 tracking-widest">
            TECH.
          </span>
        </div>

        <div className="hidden md:flex gap-10 text-[10px] uppercase tracking-[0.3em] font-semibold">
          <a href="#hero" className="hover:text-[#1f4d1f] transition-colors">
            {t[lang]["nav-home"]}
          </a>
          <a
            href="#hardware"
            className="hover:text-[#1f4d1f] transition-colors"
          >
            {t[lang]["nav-hw"]}
          </a>
          <a
            href="#announcements"
            className="hover:text-[#1f4d1f] transition-colors"
          >
            {t[lang]["nav-ann"]}
          </a>
          <Link
            href="/admin"
            className="text-[#1f4d1f] border-b border-[#1f4d1f]"
          >
            ADMIN_PORTAL
          </Link>
        </div>

        <div className="flex gap-4 text-[10px] font-mono">
          {(["en", "tr", "sq"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`${lang === l ? "text-[#1f4d1f] font-bold" : "opacity-40"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section
        id="hero"
        className="min-h-screen flex items-center px-6 md:px-[10%] pt-20 relative z-10"
      >
        <div className="max-w-4xl">
          <span className="text-[#1f4d1f] font-mono text-xs tracking-[5px] mb-6 block uppercase">
            Est. 2025 // Steel & Silicon
          </span>
          <h1 className="text-6xl md:text-[10rem] font-bold leading-[0.8] tracking-tighter mb-6">
            {t[lang]["hero-title"]}
          </h1>
          <div className="text-3xl md:text-6xl text-[#1f4d1f] font-bold mb-8 opacity-80">
            TECH<span className="animate-pulse">_</span>
          </div>
          <p className="text-lg md:text-2xl text-zinc-500 max-w-2xl leading-relaxed mb-10">
            {t[lang]["hero-desc"]}
          </p>
          <a
            href="#hardware"
            className="inline-block bg-[#1f4d1f] text-white px-10 py-5 rounded-sm text-xs font-bold tracking-[3px] uppercase hover:bg-black transition-all"
          >
            Explore Hardware
          </a>

          <div className="mt-16 rounded-3xl overflow-hidden shadow-2xl border border-zinc-100">
            <img
              src="/assets/images/terroferrotraktor1.jpeg"
              alt="Terra Ferro Field"
              className="w-full h-[300px] md:h-[550px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS (DYNAMIC) */}
      <section
        id="announcements"
        className="py-20 px-6 md:px-[10%] relative z-10 bg-zinc-50/50"
      >
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-7xl font-bold tracking-tighter uppercase">
              {t[lang]["nav-ann"]}
            </h2>
            <p className="text-[#1f4d1f] font-mono text-xs mt-2 tracking-widest">
              LIVE_API_FEED // CLOUD_SYNC
            </p>
          </div>
          <p className="max-w-md text-sm text-zinc-500 leading-relaxed">
            Saha operasyonlarımızdan ve teknolojik gelişmelerimizden anlık
            haberler.
          </p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-10 no-scrollbar snap-x">
          {announcements.map((ann) => (
            <article
              key={ann.id}
              className="min-w-[300px] md:min-w-[400px] bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm snap-start hover:border-[#1f4d1f] transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-mono bg-zinc-100 px-3 py-1 rounded-full uppercase tracking-widest text-zinc-500 group-hover:bg-[#1f4d1f] group-hover:text-white transition-colors">
                  Update
                </span>
                <div className="w-2 h-2 rounded-full bg-[#1f4d1f] animate-pulse"></div>
              </div>
              {ann.media_data?.[0]?.url && (
                <div className="w-full h-48 mb-6 rounded-2xl overflow-hidden bg-zinc-100">
                  <img
                    src={ann.media_data[0].url}
                    className="w-full h-full object-cover"
                    alt={ann.title}
                  />
                </div>
              )}
              <h3 className="text-2xl font-bold mb-3">{ann.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3">
                {ann.content.substring(0, 150)}...
              </p>
              <div className="mt-8 pt-6 border-t border-zinc-50 text-[10px] font-mono text-zinc-300 uppercase tracking-widest">
                {new Date(ann.created_at).toLocaleDateString()} // Secure Link
              </div>
            </article>
          ))}
          {announcements.length === 0 && (
            <p className="text-zinc-400 font-mono text-xs">
              No active announcements found.
            </p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="p-10 md:p-20 bg-white border-t border-zinc-100 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold tracking-tighter">
              TERRAFERRO<span className="text-[#1f4d1f]">TECH</span>.
            </div>
            <p className="text-[10px] text-zinc-400 tracking-[4px] uppercase mt-4">
              © 2025 ALL RIGHTS RESERVED
            </p>
          </div>
          <div className="flex flex-col gap-2 text-center md:text-right font-mono text-xs text-zinc-500 uppercase tracking-widest">
            <a
              href="mailto:terraferrotech@gmail.com"
              className="hover:text-[#1f4d1f]"
            >
              terraferrotech@gmail.com
            </a>
            <p>LOCATION: LUSHNJE, ALBANIA</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
