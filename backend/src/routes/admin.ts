import { Router } from 'express';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import TelegramBotService from '../services/telegram-bot';

const router = Router();

// Apply both auth and admin middleware
router.use(authMiddleware, adminMiddleware);

/**
 * GET /admin/animals
 * Returns all animals for admin management
 */
router.get('/animals', async (req, res) => {
  try {
    const animals = await prisma.animal.findMany({
      include: {
        user: true,
        media: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        purchaseDate: 'desc',
      },
    });

    res.json({ animals });
  } catch (error) {
    console.error('Error fetching animals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /admin/animals/:id/status
 * Updates animal status
 */
router.put('/animals/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, slaughterDate } = req.body;

    if (!status || !['growing', 'ready', 'slaughtered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = { status };
    if (slaughterDate) {
      updateData.slaughterDate = new Date(slaughterDate);
    }

    const animal = await prisma.animal.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
      },
    });

    // Send notification if status changed to "ready"
    if (status === 'ready' && process.env.TELEGRAM_BOT_TOKEN) {
      const botService = new TelegramBotService(process.env.TELEGRAM_BOT_TOKEN);
      await botService.sendReadyNotification(animal.user.telegramId, animal.id);
    }

    res.json({ animal });
  } catch (error) {
    console.error('Error updating animal status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /admin/animals/:id/media
 * Adds media (photo/video) to an animal
 */
router.post('/animals/:id/media', async (req, res) => {
  try {
    const { id } = req.params;
    const { url, type } = req.body;

    if (!url || !type || !['photo', 'video'].includes(type)) {
      return res.status(400).json({ error: 'Invalid media data' });
    }

    // Verify animal exists
    const animal = await prisma.animal.findUnique({
      where: { id },
    });

    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const media = await prisma.media.create({
      data: {
        animalId: id,
        url,
        type,
      },
    });

    res.json({ media });
  } catch (error) {
    console.error('Error adding media:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /admin/media/:id
 * Deletes media
 */
router.delete('/media/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.media.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /admin/users
 * Returns all users
 */
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            animals: true,
            payments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
