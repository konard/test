import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import NOWPaymentsService from '../services/nowpayments';

const router = Router();

const nowPayments = new NOWPaymentsService(
  process.env.NOWPAYMENTS_API_KEY || ''
);

// Animal market prices
const ANIMAL_PRICES = {
  chicken: 50,
  pig: 500,
  cow: 2000,
};

/**
 * POST /payments/create
 * Creates a new payment for animal purchase or maintenance
 */
router.post('/create', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { animalType, type, currency } = req.body;

    if (!animalType || !type) {
      return res.status(400).json({ error: 'animalType and type are required' });
    }

    if (type !== 'purchase' && type !== 'maintenance') {
      return res.status(400).json({ error: 'Invalid payment type' });
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: req.user!.telegramId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get price
    const amount = ANIMAL_PRICES[animalType as keyof typeof ANIMAL_PRICES];
    if (!amount) {
      return res.status(400).json({ error: 'Invalid animal type' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        type,
        amount,
        currency: currency || 'TON',
        status: 'pending',
      },
    });

    // Create NOWPayments payment
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const paymentResponse = await nowPayments.createPayment({
        price_amount: amount,
        price_currency: 'USD', // Base currency
        pay_currency: currency || 'TON',
        order_id: payment.id,
        order_description: `${type} - ${animalType}`,
        ipn_callback_url: `${backendUrl}/payments/webhook`,
      });

      // Update payment with external ID
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          externalId: paymentResponse.payment_id,
        },
      });

      res.json({
        paymentId: payment.id,
        paymentUrl: paymentResponse.payment_url,
        payAddress: paymentResponse.pay_address,
        payAmount: paymentResponse.pay_amount,
        payCurrency: paymentResponse.pay_currency,
      });
    } catch (error) {
      console.error('NOWPayments error:', error);

      // For MVP, return a mock payment URL
      res.json({
        paymentId: payment.id,
        paymentUrl: `https://nowpayments.io/payment/?iid=${payment.id}`,
        mock: true,
        message: 'Using mock payment for development',
      });
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /payments/webhook
 * Webhook endpoint for NOWPayments IPN callbacks
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-nowpayments-sig'] as string;
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    if (!ipnSecret) {
      console.error('IPN secret not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify signature
    const payload = JSON.stringify(req.body);
    const isValid = nowPayments.verifyIPN(signature, payload, ipnSecret);

    if (!isValid) {
      console.error('Invalid IPN signature');
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const { order_id, payment_status, payment_id } = req.body;

    // Update payment status
    const payment = await prisma.payment.findUnique({
      where: { id: order_id },
    });

    if (!payment) {
      console.error('Payment not found:', order_id);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Map NOWPayments status to our status
    let status = 'pending';
    if (payment_status === 'finished' || payment_status === 'confirmed') {
      status = 'success';
    } else if (payment_status === 'failed' || payment_status === 'expired') {
      status = 'failed';
    }

    await prisma.payment.update({
      where: { id: order_id },
      data: {
        status,
        externalId: payment_id,
      },
    });

    // If payment successful and it's a purchase, create the animal
    if (status === 'success' && payment.type === 'purchase') {
      // Get animal type from payment (we'd need to store this in payment)
      // For now, we'll create a placeholder
      // In production, we'd store animalType in the payment record
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /payments/my
 * Returns user's payment history
 */
router.get('/my', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: req.user!.telegramId },
      include: {
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      payments: user.payments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
