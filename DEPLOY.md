# Freedom Audit - Deployment Guide

## ✅ Status: Ready for Production

The app has been built successfully and is ready to deploy to Vercel.

## Quick Deploy (5 minutes)

### 1. Configure Environment Variables

You need 4 API keys. Get them from:

**Anthropic API** (for Claude Sonnet 4)
- https://console.anthropic.com/settings/keys
- Add to `.env.local` as `ANTHROPIC_API_KEY`

**Supabase** (database)
- https://supabase.com → New Project
- Get URL and anon key from Project Settings → API
- Add as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Resend** (email delivery)
- https://resend.com/api-keys
- Add as `RESEND_API_KEY`

**Admin Email**
- Set `ADMIN_EMAIL=mike@mbrown.co`

### 2. Set Up Database

```bash
# In Supabase SQL Editor, run:
cat supabase-schema.sql
```

This creates the `assessments` table.

### 3. Verify Domain in Resend

1. Go to https://resend.com/domains
2. Add domain: `unbreakablewealth.com`
3. Add DNS records shown
4. Wait for verification

### 4. Deploy to Vercel

```bash
# Install Vercel CLI (if needed)
npm i -g vercel

# Deploy
cd /home/openclaw/.openclaw/workspace/freedom-audit
vercel --prod
```

Follow prompts:
- Link to existing project or create new one
- Framework preset: Next.js
- Build command: default (npm run build)
- Output directory: default (.next)

### 5. Add Environment Variables to Vercel

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all 4 variables from `.env.local`
3. Mark them all as Production, Preview, and Development

### 6. Configure Custom Domain

In Vercel:
1. Project Settings → Domains
2. Add: `freedom.unbreakablewealth.com`
3. Add DNS records to your domain provider:
   ```
   Type: CNAME
   Name: freedom
   Value: cname.vercel-dns.com
   ```

### 7. Test End-to-End

1. Visit https://freedom.unbreakablewealth.com
2. Enter name and email
3. Answer a few questions
4. Complete assessment
5. Verify report generated
6. Check email inbox for PDF
7. Check admin email for raw answers

## Troubleshooting

**Build fails on Vercel:**
- Check Node version (should be 18 or 20)
- Verify all dependencies installed

**Email not sending:**
- Verify domain in Resend
- Check Resend API key
- Check email address format in code

**Database errors:**
- Verify Supabase SQL ran successfully
- Check Supabase URL and anon key
- Verify RLS policies enabled

**Report generation fails:**
- Check Anthropic API key
- Verify API key has credits
- Check browser console for errors

## Files Reference

- `app/page.tsx` - Main UI (completed ✅)
- `app/styles.css` - Exact prototype styles (✅)
- `app/components.tsx` - Reusable components (✅)
- `app/api/generate/route.ts` - Claude API integration (✅)
- `app/api/assessment/save/route.ts` - Save to Supabase (✅)
- `app/api/assessment/load/route.ts` - Load from Supabase (✅)
- `app/api/send-report/route.ts` - Email + PDF (✅)
- `supabase-schema.sql` - Database schema (✅)

## What Works

✅ Exact UI from prototype
✅ 22 questions across 10 sections
✅ Server-side AI generation (Claude Sonnet 4)
✅ Auto-save to database (resume anytime)
✅ Email report as PDF attachment
✅ Admin notification with raw answers
✅ Mobile responsive
✅ Custom domain ready

## Production Checklist

- [ ] Get Anthropic API key
- [ ] Create Supabase project
- [ ] Run database schema
- [ ] Get Resend API key
- [ ] Verify domain in Resend
- [ ] Add environment variables to Vercel
- [ ] Deploy to Vercel
- [ ] Configure custom domain
- [ ] Test full flow
- [ ] Verify emails arriving

**Estimated time: 15-20 minutes total**

Once deployed, share the link: https://freedom.unbreakablewealth.com
