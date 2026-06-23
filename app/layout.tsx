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
  title: "BIGT — Bahasa Indonesia Global Test | Standar Kemahiran Bahasa Indonesia untuk Dunia",
  description: "BIGT adalah sistem asesmen kemahiran Bahasa Indonesia generasi baru berbasis kecerdasan buatan, adaptive testing, dan kerangka AKSI yang dirancang untuk mendukung internasionalisasi Bahasa Indonesia.",
  keywords: ["BIGT", "Bahasa Indonesia Global Test", "Bahasa Indonesia", "CEFR", "tes kemahiran", "language assessment", "adaptive testing", "AKSI"],
  authors: [{ name: "BIGT" }],
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "BIGT — Bahasa Indonesia Global Test",
    description: "BIGT adalah sistem asesmen kemahiran Bahasa Indonesia generasi baru berbasis kecerdasan buatan, adaptive testing, dan kerangka AKSI yang dirancang untuk mendukung internasionalisasi Bahasa Indonesia.",
    url: "https://bahasacerdas.site",
    siteName: "BIGT — Bahasa Indonesia Global Test",
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
