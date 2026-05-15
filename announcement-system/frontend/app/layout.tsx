import type { Metadata } from "next";

import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Terra Ferro Tech Announcements",
  description: "Glassmorphism-style announcement system for Terra Ferro Tech",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
