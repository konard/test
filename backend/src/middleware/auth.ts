import { Request, Response, NextFunction } from 'express';
import { validateTelegramInitData, parseTelegramInitData } from '../utils/telegram';

export interface AuthRequest extends Request {
  user?: {
    telegramId: string;
    username?: string;
    firstName: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('tma ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header' });
  }

  const initData = authHeader.substring(4); // Remove 'tma ' prefix
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Validate initData
  if (!validateTelegramInitData(initData, botToken)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Telegram data' });
  }

  try {
    const userData = parseTelegramInitData(initData);
    req.user = userData;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Failed to parse user data' });
  }
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const adminIds = process.env.ADMIN_TELEGRAM_IDS?.split(',') || [];

  if (!adminIds.includes(req.user.telegramId)) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  next();
}
