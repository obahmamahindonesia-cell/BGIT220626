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
  title: "BGIT — Bahasa Global Indonesia Test | Standar Kemahiran Bahasa Indonesia untuk Dunia",
  description: "BGIT (Bahasa Global Indonesia Test) adalah sistem asesmen kemahiran Bahasa Indonesia modern berbasis AI, CEFR-aligned, adaptive testing, diagnostic report, dan sertifikasi digital.",
  keywords: ["BGIT", "Bahasa Global Indonesia Test", "Bahasa Indonesia", "CEFR", "tes kemahiran", "language assessment", "adaptive testing"],
  authors: [{ name: "BGIT" }],
  openGraph: {
    title: "BGIT — Bahasa Global Indonesia Test",
    description: "BGIT (Bahasa Global Indonesia Test) adalah sistem asesmen kemahiran Bahasa Indonesia modern berbasis AI, CEFR-aligned, adaptive testing, diagnostic report, dan sertifikasi digital.",
    url: "https://bahasacerdas.site",
    siteName: "BGIT — Bahasa Global Indonesia Test",
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
