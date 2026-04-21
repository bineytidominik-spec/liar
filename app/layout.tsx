import type { Metadata, Viewport } from "next";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Blender — Party Game",
  description: "Ein Pass-and-Play-Partyspiel für 3–15 Spieler. Einer kennt das geheime Wort nicht — findet den Blender, bevor er sich herausredet.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0e0e1c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${fraunces.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
