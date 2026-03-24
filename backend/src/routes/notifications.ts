import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = '20', unreadOnly } = req.query;

    const where: Record<string, unknown> = { destinataireId: req.user!.userId };
    if (unreadOnly === 'true') where.lu = false;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    const unreadCount = await prisma.notification.count({
      where: { destinataireId: req.user!.userId, lu: false },
    });

    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });

    if (!notification || notification.destinataireId !== req.user!.userId) {
      res.status(404).json({ success: false, error: 'Notification introuvable' });
      return;
    }

    await prisma.notification.update({
      where: { id: req.params.id },
      data: { lu: true },
    });

    res.json({ success: true, message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { destinataireId: req.user!.userId, lu: false },
      data: { lu: true },
    });

    res.json({ success: true, message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

export default router;
