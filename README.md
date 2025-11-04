# Reality Farm (Ферма Реальности)

A Telegram Mini App for buying and raising real farm animals. Users can purchase animals, track their growth, pay for maintenance, and receive meat products after the growth period.

## Features

### MVP Features (17-day sprint)

- **Telegram Authentication**: Secure authentication using Telegram WebApp initData validation
- **Animal Market**: Browse and purchase animals (chicken, pig, cow) with different prices and growth periods
- **My Animals**: Track your animals with progress bars and growth status
- **Payment Integration**: NOWPayments integration for cryptocurrency payments (TON, USDT, BTC, ETH)
- **Telegram Bot Notifications**:
  - Weekly photo reports of your animals
  - Reminders 3 days before slaughter date
- **Multi-language Support**: Russian and English (i18n ready)
- **Admin Panel**: Basic panel for uploading media and updating animal status
- **Responsive Design**: Optimized for iOS and Android Telegram apps

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Telegram SDK**: @twa-dev/sdk
- **i18n**: react-i18next
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Bot Framework**: Telegraf
- **Payments**: NOWPayments API
- **Scheduling**: node-cron

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render.com
- **Database**: Supabase (PostgreSQL)

## Project Structure

```
.
├── frontend/          # Telegram Mini App (React + Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── services/      # API services
│   │   ├── locales/       # i18n translations
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── backend/           # API Server (Node.js + Express)
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utility functions
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
│
├── admin/             # Admin Panel (React + Vite)
│   └── src/
│
├── shared/            # Shared types and constants
│   └── src/
│
└── package.json       # Root package.json (workspace)
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- NOWPayments API Key (optional for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xlabtg/test.git
   cd test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**

   Backend (.env):
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your values
   ```

   Frontend (.env):
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Setup database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run development servers**

   Terminal 1 (Backend):
   ```bash
   npm run dev:backend
   ```

   Terminal 2 (Frontend):
   ```bash
   npm run dev:frontend
   ```

   Terminal 3 (Admin - optional):
   ```bash
   npm run dev:admin
   ```

### Development URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Admin Panel: http://localhost:5174

## Database Schema

The application uses the following main entities:

- **User**: Telegram user information
- **Animal**: Animal instances owned by users
- **Payment**: Payment records for purchases and maintenance
- **Media**: Photos and videos of animals

See `backend/prisma/schema.prisma` for the complete schema.

## API Endpoints

### Authentication
- `POST /auth/telegram` - Authenticate via Telegram initData

### Animals
- `GET /animals/market` - Get available animals for purchase
- `GET /animals/my` - Get user's animals (authenticated)
- `GET /animals/:id` - Get animal details (authenticated)

### Payments
- `POST /payments/create` - Create payment (authenticated)
- `POST /payments/webhook` - NOWPayments IPN webhook
- `GET /payments/my` - Get payment history (authenticated)

### Admin (requires admin access)
- `GET /admin/animals` - Get all animals
- `PUT /admin/animals/:id/status` - Update animal status
- `POST /admin/animals/:id/media` - Add media to animal
- `DELETE /admin/media/:id` - Delete media
- `GET /admin/users` - Get all users

## Telegram Bot Setup

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Get the bot token
3. Set the menu button:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setChatMenuButton" \
     -H "Content-Type: application/json" \
     -d '{
       "menu_button": {
         "type": "web_app",
         "text": "Open Farm",
         "web_app": {
           "url": "https://your-frontend-url.vercel.app"
         }
       }
     }'
   ```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to:
- Vercel (Frontend)
- Render.com (Backend)
- Supabase (Database)

## Security

- Telegram initData validation following [official documentation](https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app)
- Admin access controlled via whitelist (ADMIN_TELEGRAM_IDS)
- Payment webhooks verified with HMAC signatures
- No storage of payment card data (only external payment IDs)

## Testing

To test the MVP with 20 users:

1. Deploy to production (see DEPLOYMENT.md)
2. Share the bot link with test users
3. Test flows:
   - Authentication
   - Animal purchase
   - Payment (use small test amounts)
   - Photo reports (trigger manually via admin)
   - Status updates

## Contributing

This is an MVP project. See the issue tracker for planned features.

## License

MIT

## Support

For issues related to:
- Telegram Mini Apps: https://core.telegram.org/bots/webapps
- NOWPayments: https://documenter.getpostman.com/view/7907941/2s93JusNJt
- Deployment: See DEPLOYMENT.md

---

**MVP Completion Target**: 17 days
**Test Group**: 20 users
**Milestone**: Nov 20, 2025
