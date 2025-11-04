import { Telegraf } from 'telegraf';
import prisma from '../utils/prisma';

export class TelegramBotService {
  private bot: Telegraf;

  constructor(token: string) {
    this.bot = new Telegraf(token);
    this.setupHandlers();
  }

  private setupHandlers() {
    this.bot.start((ctx) => {
      ctx.reply(
        'Добро пожаловать в Ферму Реальности! 🐄🐷🐔\n\n' +
        'Используйте кнопку ниже для запуска Mini App.',
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Открыть Ферму',
                  web_app: { url: process.env.FRONTEND_URL || 'https://your-app.vercel.app' },
                },
              ],
            ],
          },
        }
      );
    });

    this.bot.help((ctx) => {
      ctx.reply(
        'Команды бота:\n' +
        '/start - Запустить Mini App\n' +
        '/help - Показать помощь\n' +
        '/status - Проверить статус ваших животных'
      );
    });
  }

  async start() {
    try {
      await this.bot.launch();
      console.log('Telegram bot started successfully');
    } catch (error) {
      console.error('Failed to start Telegram bot:', error);
    }
  }

  async stop() {
    this.bot.stop('SIGINT');
  }

  /**
   * Sends a weekly photo report to the user
   */
  async sendWeeklyReport(telegramId: string, animalId: string) {
    try {
      const animal = await prisma.animal.findUnique({
        where: { id: animalId },
        include: {
          media: {
            where: { type: 'photo' },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!animal) {
        console.error('Animal not found:', animalId);
        return;
      }

      let message = `📸 Еженедельный отчёт\n\n`;
      message += `Животное: ${animal.name || animal.type}\n`;
      message += `Статус: ${animal.status === 'growing' ? 'Растёт' : animal.status}\n`;

      if (animal.media.length > 0) {
        const latestMedia = animal.media[0];
        await this.bot.telegram.sendPhoto(telegramId, latestMedia.url, {
          caption: message,
        });
      } else {
        await this.bot.telegram.sendMessage(telegramId, message);
      }
    } catch (error) {
      console.error('Error sending weekly report:', error);
    }
  }

  /**
   * Sends a reminder 3 days before slaughter
   */
  async sendSlaughterReminder(telegramId: string, animalId: string) {
    try {
      const animal = await prisma.animal.findUnique({
        where: { id: animalId },
      });

      if (!animal || !animal.slaughterDate) {
        return;
      }

      const message =
        `⏰ Напоминание!\n\n` +
        `Ваше животное (${animal.name || animal.type}) будет готово через 3 дня.\n` +
        `Дата: ${animal.slaughterDate.toLocaleDateString('ru-RU')}\n\n` +
        `Не забудьте подготовиться к получению продукции!`;

      await this.bot.telegram.sendMessage(telegramId, message);
    } catch (error) {
      console.error('Error sending slaughter reminder:', error);
    }
  }

  /**
   * Sends a notification when animal is ready
   */
  async sendReadyNotification(telegramId: string, animalId: string) {
    try {
      const animal = await prisma.animal.findUnique({
        where: { id: animalId },
      });

      if (!animal) {
        return;
      }

      const message =
        `✅ Животное готово!\n\n` +
        `Ваше животное (${animal.name || animal.type}) готово к убою.\n` +
        `Свяжитесь с администрацией для организации доставки.`;

      await this.bot.telegram.sendMessage(telegramId, message);
    } catch (error) {
      console.error('Error sending ready notification:', error);
    }
  }
}

export default TelegramBotService;
