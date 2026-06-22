import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: "UKBI-Next — Penilaian Kemahiran Bahasa Indonesia Generasi Baru",
  description: "Platform penilaian kemahiran Bahasa Indonesia setara standar internasional (CEFR-aligned, AI-powered). Ukur 6 dimensi kemahiran: Menyimak, Membaca, Berbicara, Menulis, Mediasi, dan Terintegrasi.",
  keywords: ["UKBI", "Bahasa Indonesia", "CEFR", "tes kemahiran", "language assessment"],
  authors: [{ name: "BahasaCerdas" }],
  openGraph: {
    title: "UKBI-Next — Penilaian Kemahiran Bahasa Indonesia Generasi Baru",
    description: "Platform penilaian kemahiran Bahasa Indonesia setara standar internasional (CEFR-aligned, AI-powered)",
    url: "https://bahasacerdas.site",
    siteName: "UKBI-Next",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn(inter.variable, playfair.variable)}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
