import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n/context";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const siteUrl = 'https://bahasacerdas.site'
const brandName = 'BIGT — Bahasa Indonesia Global Test'
const defaultTitle = 'BIGT — Standar Kemahiran Bahasa Indonesia untuk Dunia'
const defaultDescription = 'Sistem asesmen kemahiran Bahasa Indonesia berbasis kecerdasan buatan, Kerangka AKSI, dan standar global.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: '%s | BIGT',
  },
  description: defaultDescription,
  keywords: [
    'BIGT',
    'Bahasa Indonesia Global Test',
    'tes Bahasa Indonesia',
    'asesmen Bahasa Indonesia',
    'sertifikasi Bahasa Indonesia',
    'kemahiran Bahasa Indonesia',
    'Kerangka AKSI',
    'CEFR Bahasa Indonesia',
    'tes BIPA',
    'Indonesian proficiency test',
  ],
  authors: [{ name: 'BIGT' }],
  creator: 'BIGT',
  publisher: 'BIGT',
  applicationName: 'BIGT',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: brandName,
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BIGT — Bahasa Indonesia Global Test',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
  appleWebApp: {
    capable: true,
    title: 'BIGT',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'fb:app_id': '',
    'theme-color': '#0B1F3A',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn(inter.variable, playfair.variable)} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          <I18nProvider>
            {children}
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
