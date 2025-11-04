import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import animalsRoutes from './routes/animals';
import paymentsRoutes from './routes/payments';
import adminRoutes from './routes/admin';
import TelegramBotService from './services/telegram-bot';
import cron from 'node-cron';
import prisma from './utils/prisma';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/animals', animalsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Telegram bot
let botService: TelegramBotService | null = null;
if (process.env.TELEGRAM_BOT_TOKEN) {
  botService = new TelegramBotService(process.env.TELEGRAM_BOT_TOKEN);
  botService.start();
}

// Schedule weekly reports (every Monday at 10 AM)
cron.schedule('0 10 * * 1', async () => {
  console.log('Running weekly reports job...');

  try {
    const animals = await prisma.animal.findMany({
      where: {
        status: 'growing',
      },
      include: {
        user: true,
      },
    });

    for (const animal of animals) {
      if (botService) {
        await botService.sendWeeklyReport(animal.user.telegramId, animal.id);
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Sent ${animals.length} weekly reports`);
  } catch (error) {
    console.error('Error sending weekly reports:', error);
  }
});

// Schedule slaughter reminders (daily at 9 AM)
cron.schedule('0 9 * * *', async () => {
  console.log('Checking for slaughter reminders...');

  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const animals = await prisma.animal.findMany({
      where: {
        status: 'growing',
        slaughterDate: {
          gte: new Date(),
          lte: threeDaysFromNow,
        },
      },
      include: {
        user: true,
      },
    });

    for (const animal of animals) {
      if (botService) {
        await botService.sendSlaughterReminder(animal.user.telegramId, animal.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Sent ${animals.length} slaughter reminders`);
  } catch (error) {
    console.error('Error sending slaughter reminders:', error);
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🤖 Telegram Bot: ${process.env.TELEGRAM_BOT_TOKEN ? 'Enabled' : 'Disabled'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (botService) {
    await botService.stop();
  }
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (botService) {
    await botService.stop();
  }
  await prisma.$disconnect();
  process.exit(0);
});
