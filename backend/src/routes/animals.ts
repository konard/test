import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

const router = Router();

// Animal market data
const ANIMAL_MARKET = {
  chicken: {
    type: 'chicken',
    price: 50,
    maintenanceCost: 10,
    growthPeriodMonths: 2,
    description: 'Курица — быстрый старт в фермерство',
    expectedYield: '2-3 кг мяса',
  },
  pig: {
    type: 'pig',
    price: 500,
    maintenanceCost: 50,
    growthPeriodMonths: 6,
    description: 'Свинья — оптимальное соотношение цены и выхода',
    expectedYield: '80-100 кг мяса',
  },
  cow: {
    type: 'cow',
    price: 2000,
    maintenanceCost: 150,
    growthPeriodMonths: 8,
    description: 'Корова — максимальная отдача',
    expectedYield: '200-300 кг мяса',
  },
};

/**
 * GET /animals/market
 * Returns available animals for purchase
 */
router.get('/market', (req, res) => {
  res.json({
    animals: Object.values(ANIMAL_MARKET),
  });
});

/**
 * GET /animals/my
 * Returns user's animals
 */
router.get('/my', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: req.user!.telegramId },
      include: {
        animals: {
          include: {
            media: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            purchaseDate: 'desc',
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      animals: user.animals,
    });
  } catch (error) {
    console.error('Error fetching animals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /animals/:id
 * Returns animal details
 */
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { telegramId: req.user!.telegramId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const animal = await prisma.animal.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        media: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Calculate progress
    const marketInfo = ANIMAL_MARKET[animal.type as keyof typeof ANIMAL_MARKET];
    const totalDays = marketInfo.growthPeriodMonths * 30;
    const daysPassed = Math.floor(
      (Date.now() - animal.purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const progress = Math.min(100, Math.floor((daysPassed / totalDays) * 100));

    res.json({
      animal: {
        ...animal,
        progress,
        marketInfo,
      },
    });
  } catch (error) {
    console.error('Error fetching animal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
