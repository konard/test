# Deployment Guide

This guide explains how to deploy the Reality Farm Telegram Mini App to production.

## Overview

The application consists of three parts:
- **Frontend**: Telegram Mini App (React + Vite) → Deploy to Vercel
- **Backend**: API Server (Node.js + Express) → Deploy to Render.com
- **Database**: PostgreSQL → Use Supabase

## Prerequisites

1. Telegram Bot Token (from [@BotFather](https://t.me/botfather))
2. NOWPayments API Key (from [nowpayments.io](https://nowpayments.io))
3. Accounts on:
   - [Vercel](https://vercel.com) (frontend)
   - [Render.com](https://render.com) (backend)
   - [Supabase](https://supabase.com) (database)

## Step 1: Setup Database (Supabase)

1. Create a new project on Supabase
2. Copy the connection string from Settings → Database
3. It should look like: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`

## Step 2: Deploy Backend (Render.com)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure:
   - **Build Command**: `npm install && cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
4. Add environment variables:
   ```
   DATABASE_URL=your_supabase_connection_string
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_BOT_SECRET=your_bot_secret
   NOWPAYMENTS_API_KEY=your_api_key
   NOWPAYMENTS_IPN_SECRET=your_ipn_secret
   ADMIN_TELEGRAM_IDS=comma_separated_telegram_ids
   FRONTEND_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   PORT=3001
   ```
5. Deploy and note the URL (e.g., `https://ferma-backend.onrender.com`)

## Step 3: Run Database Migrations

After backend is deployed, run migrations via Render Shell:

```bash
cd backend
npx prisma migrate deploy
```

## Step 4: Deploy Frontend (Vercel)

1. Import your GitHub repository to Vercel
2. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
4. Deploy and note the URL (e.g., `https://ferma-realnosti.vercel.app`)

## Step 5: Configure Telegram Bot

1. Open [@BotFather](https://t.me/botfather) in Telegram
2. Send `/setmenubutton`
3. Select your bot
4. Enter button text: "Open Farm" or "Открыть Ферму"
5. Enter Mini App URL: `https://your-frontend.vercel.app`

Alternatively, use Bot API:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "Open Farm",
      "web_app": {
        "url": "https://your-frontend.vercel.app"
      }
    }
  }'
```

## Step 6: Configure NOWPayments Webhook

1. Log in to [NOWPayments](https://nowpayments.io)
2. Go to Settings → IPN (Instant Payment Notifications)
3. Set IPN Callback URL: `https://your-backend.onrender.com/payments/webhook`
4. Save the IPN Secret and add it to backend environment variables

## Step 7: Test the Application

1. Open your bot in Telegram
2. Click "Open Farm" button
3. Test authentication
4. Test animal purchase flow (with small test payment)
5. Verify webhook is working

## Environment Variables Summary

### Backend (.env)
```bash
DATABASE_URL=postgresql://...
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_BOT_SECRET=your_secret
NOWPAYMENTS_API_KEY=your_key
NOWPAYMENTS_IPN_SECRET=your_ipn_secret
ADMIN_TELEGRAM_IDS=123456,789012
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.onrender.com
NODE_ENV=production
PORT=3001
```

### Frontend (.env)
```bash
VITE_API_URL=https://your-backend.onrender.com
```

## Monitoring and Maintenance

### Logs
- **Frontend**: Vercel Dashboard → Deployments → Logs
- **Backend**: Render Dashboard → Logs

### Database
- Access via Supabase Dashboard → Table Editor
- Or use: `npx prisma studio` (connects to production DB)

### Scheduled Jobs
Backend runs cron jobs for:
- Weekly photo reports (Mondays at 10 AM)
- Slaughter reminders (Daily at 9 AM)

Monitor these in backend logs.

## Troubleshooting

### Authentication Issues
- Verify TELEGRAM_BOT_TOKEN is correct
- Check that initData validation is working
- Ensure FRONTEND_URL matches exactly

### Payment Issues
- Verify NOWPAYMENTS_API_KEY is valid
- Check IPN webhook is receiving callbacks
- Review payment logs in backend

### Database Issues
- Check DATABASE_URL connection string
- Verify Supabase project is active
- Run migrations: `npx prisma migrate deploy`

## Security Checklist

- [ ] All environment variables are set
- [ ] Admin Telegram IDs are whitelisted
- [ ] Database has strong password
- [ ] HTTPS is enabled (automatic on Vercel/Render)
- [ ] initData validation is working
- [ ] IPN webhook signature verification is enabled

## Scaling Considerations

For MVP (20 users):
- Supabase Free Tier: ✓
- Render Free Tier: ✓ (but may sleep)
- Vercel Free Tier: ✓

For Production (>100 users):
- Upgrade Render to Starter ($7/mo)
- Keep Supabase Free (500MB, sufficient for MVP)
- Vercel Free tier handles up to 100GB bandwidth

## Support

For issues or questions:
- Check logs first
- Review Telegram Mini Apps documentation
- Test with Telegram Dev Tools
