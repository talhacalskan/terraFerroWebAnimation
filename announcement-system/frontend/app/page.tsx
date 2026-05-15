"use client";

import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    // Animasyonlar ve scriptler yüklendiğinde sayfayı bir kez tazelemesi için (opsiyonel)
    console.log("Terra Ferro Tech Loaded");
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              obsidian: "#ffffff",
              accent: "#1f4d1f",
              itCyan: "#1f4d1f",
              warning: "#ffc107",
            },
            fontFamily: {
              space: ["Space Grotesk", "sans-serif"],
              inter: ["Inter", "sans-serif"],
            },
          },
        },
      };
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollToPlugin.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

    <style>
      :root {
        --obsidian: #ffffff;
        --accent: #1f4d1f;
        --it-cyan: #1f4d1f;
        --warning: #ffc107;
        --text-main: #1a1a1a;
      }
      body { background-color: #ffffff; color: #1a1a1a; font-family: 'Inter', sans-serif; overflow-x: hidden; margin:0; }
      .glass-panel { background: rgba(31, 77, 31, 0.06); backdrop-filter: blur(8px); border: 1px solid rgba(31, 77, 31, 0.18); border-radius: 20px; }
      #preloader { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: #fff; z-index: 9999; display: flex; justify-content: center; align-items: center; transition: opacity 0.8s; }
      #preloader.loaded { opacity: 0; visibility: hidden; }
      .tech-subtitle { font-size: 4rem; color: var(--accent); letter-spacing: 0.2em; font-family: 'Space Grotesk'; font-weight: 700; }
    </style>

    <div id="preloader"><div class="loading-text">SYSTEM INITIALIZING...</div></div>
    
    <nav class="fixed top-0 left-0 w-full p-4 md:p-8 z-50 flex justify-between items-center bg-white/40 backdrop-blur-sm">
      <div class="text-xl md:text-2xl font-bold tracking-tighter">
        <span class="text-[var(--accent)]">TERRA</span>FERRO<span class="text-[0.7em] ml-1">TECH.</span>
      </div>
      <div class="flex gap-8 font-medium tracking-widest text-[10px] uppercase">
        <a href="#hero">Biosphere</a>
        <a href="#hardware">Hardware</a>
        <a href="#announcements">Announcements</a>
        <a href="/admin" style="color:var(--accent); font-weight:bold; border-bottom:1px solid var(--accent)">ADMIN_PORTAL</a>
      </div>
    </nav>

    <div id="canvas-container" style="position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:0; pointer-events:none;"></div>

    <main class="relative z-10 w-full">
      <section id="hero" class="min-h-screen flex items-center px-8 md:px-[8%]">
        <div class="max-w-4xl w-full">
          <span class="text-[var(--accent)] font-mono tracking-widest mb-4 block text-xs md:text-base">EST. 2025 // STEEL & SILICON</span>
          <h1 class="text-6xl md:text-9xl mb-4 font-bold leading-tight">TERRA FERRO</h1>
          <div class="tech-subtitle">TECH</div>
          <p class="text-sm md:text-2xl text-gray-600 mb-12 max-w-2xl leading-relaxed">
            We supply the industry's most durable agricultural attachments today, while engineering the autonomous drones of tomorrow.
          </p>
          <div class="flex gap-6">
            <a href="#hardware" class="bg-[var(--accent)] text-white px-8 py-4 rounded font-bold uppercase tracking-widest text-xs">Explore Hardware</a>
          </div>
          <figure class="mt-12 rounded-[28px] overflow-hidden border border-gray-200">
            <img src="/assets/images/terroferrotraktor1.jpeg" class="h-[300px] md:h-[500px] w-full object-cover" alt="Traktör" />
          </figure>
        </div>
      </section>

      <section id="announcements" class="py-20 px-8">
        <h2 class="text-4xl md:text-7xl font-bold mb-8">ANNOUNCEMENTS</h2>
        <div class="glass-panel p-8 min-h-[200px] flex items-center justify-center text-zinc-400 font-mono">
          Duyurular Yükleniyor... (Admin panelinden ekleme yapın)
        </div>
      </section>
    </main>

    <footer class="p-10 md:p-20 border-t border-gray-300 bg-white">
      <div class="flex flex-col md:flex-row justify-between items-center gap-10">
        <div class="text-xl font-bold">TERRAFERRO<span class="text-[var(--accent)]">TECH</span>.</div>
        <div class="text-xs opacity-50 font-mono">© 2025 ALL RIGHTS RESERVED // ALBANIA</div>
      </div>
    </footer>

    <script>
      window.addEventListener('load', () => {
        document.getElementById('preloader').classList.add('loaded');
      });

      // Three.js Kristal
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.getElementById('canvas-container').appendChild(renderer.domElement);
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(3,0), new THREE.MeshBasicMaterial({color: 0x1f4d1f, wireframe:true, transparent:true, opacity:0.1}));
      scene.add(crystal);
      camera.position.z = 10;
      function animate() { requestAnimationFrame(animate); crystal.rotation.y += 0.002; renderer.render(scene, camera); }
      animate();
    </script>
        `,
      }}
    />
  );
}
