# Freedom Audit - Next.js Production App

Complete production implementation of The Freedom Audit assessment tool.

## Setup Instructions

### 1. Environment Variables

Create `.env.local` with:

```env
# Anthropic API
ANTHROPIC_API_KEY=your_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Resend (Email)
RESEND_API_KEY=re_your_key_here

# Admin Email
ADMIN_EMAIL=mike@mbrown.co
```

### 2. Database Setup

1. Go to your Supabase project
2. Run the SQL in `supabase-schema.sql` in the SQL Editor
3. This creates the `assessments` table with RLS policies

### 3. Email Setup (Resend)

1. Sign up at resend.com
2. Add your API key to `.env.local`
3. Verify domain `unbreakablewealth.com` in Resend dashboard
4. Update the `from` addresses in `/app/api/send-report/route.ts` if needed

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add environment variables in Vercel dashboard.

### 5. Custom Domain

In Vercel:
1. Go to Project Settings → Domains
2. Add `freedom.unbreakablewealth.com`
3. Add the DNS records shown to your domain provider

## Architecture

- **Frontend**: Next.js 15 App Router, React, TypeScript
- **Backend**: Next.js API Routes (server-side only)
- **AI**: Anthropic Claude Sonnet 4 (via server API route)
- **Database**: Supabase (Postgres)
- **Email**: Resend
- **PDF**: PDFKit (server-side generation)
- **Deployment**: Vercel

## Key Files

- `app/page.tsx` - Main assessment UI (ported from prototype)
- `app/api/generate/route.ts` - Anthropic generation endpoint
- `app/api/assessment/save/route.ts` - Save progress to Supabase
- `app/api/assessment/load/route.ts` - Load saved progress
- `app/api/send-report/route.ts` - Email report with PDF
- `app/styles.css` - Exact prototype styles

## Features

✅ Exact UI from prototype
✅ Server-side Anthropic API calls
✅ Auto-save to Supabase (resume later)
✅ Email delivery with PDF attachment
✅ Admin notification with raw answers
✅ Custom domain ready
✅ Mobile responsive

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Notes

- API keys must be server-side only (never exposed to browser)
- Auto-save triggers on every answer change
- Email sent automatically when report completes
- PDF generated server-side for security
- Resume functionality uses email as lookup key
