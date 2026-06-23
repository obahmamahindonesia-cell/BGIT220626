# BIGT — Bahasa Indonesia Global Test

**Standar Kemahiran Bahasa Indonesia untuk Dunia.**

BIGT adalah sistem asesmen kemahiran Bahasa Indonesia modern berbasis kecerdasan buatan, Kerangka AKSI, dan standar global yang dirancang untuk mendukung internasionalisasi Bahasa Indonesia.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Charts:** Recharts
- **AI Integration:** OpenAI GPT-4o for scoring

## Brand Identity

| Element | Value |
|---|---|
| Nama | BIGT — Bahasa Indonesia Global Test |
| Tagline | Standar Kemahiran Bahasa Indonesia untuk Dunia |
| Production | https://bahasacerdas.site |
| Navy | `#0B1F3A` |
| Royal | `#123E7C` |
| Crimson | `#D7193F` |
| Gold | `#C9A227` |

## Metadata & SEO

- Title template: `%s | BIGT`
- Default title: `BIGT — Standar Kemahiran Bahasa Indonesia untuk Dunia`
- Description: Sistem asesmen kemahiran Bahasa Indonesia berbasis kecerdasan buatan, Kerangka AKSI, dan standar global.
- OG image: `/og-image.png` (1200x630)
- Favicon/icon source: `/public/icon_BIGT.png`
- Manifest: `/manifest.webmanifest`
- Robots: `/robots.ts`
- Sitemap: `/sitemap.ts`

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Production deploys go through **Vercel** (mr-dom02/bgit-220626):

```bash
vercel --prod
```

The production domain is [https://bahasacerdas.site](https://bahasacerdas.site).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

- `DATABASE_URL` — Supabase PostgreSQL direct connection
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `OPENAI_API_KEY` — OpenAI API key for AI scoring
