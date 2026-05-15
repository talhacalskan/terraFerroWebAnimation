"use client";

export default function HomePage() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

          <script>
            // RESİM YOLLARINI DÜZELTME: 
            // Yapıştırdığın kodda "assets/" yazan her yeri "/assets/" yap.
            // Örneğin: src="assets/..." yerine src="/assets/..." yazmalısın.
          </script>
        `,
      }}
    />
  );
}
