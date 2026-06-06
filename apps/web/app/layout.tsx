import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PwaRegister } from "@/components/pwa-register";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Fogora — Copilotul tău calm.",
  description:
    "Fogora îți spune din timp când zborul tău e la risc de ceață și îți dă alternative.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/cine/fogora-mark.png",
    apple: "/cine/fogora-mark.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1d1610",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className={`${hanken.variable} ${instrument.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}
