import { Router } from 'express';
import { validateTelegramInitData, parseTelegramInitData } from '../utils/telegram';
import prisma from '../utils/prisma';

const router = Router();

/**
 * POST /auth/telegram
 * Authenticates user via Telegram initData
 */
router.post('/telegram', async (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'initData is required' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Validate initData
    if (!validateTelegramInitData(initData, botToken)) {
      return res.status(401).json({ error: 'Invalid Telegram data' });
    }

    // Parse user data
    const userData = parseTelegramInitData(initData);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { telegramId: userData.telegramId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: userData.telegramId,
          username: userData.username,
          firstName: userData.firstName,
          lang: userData.languageCode || 'ru',
        },
      });
    }

    // Return user data (in production, you'd also generate a JWT token)
    res.json({
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lang: user.lang,
      },
      token: initData, // For MVP, we'll use initData as token
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
