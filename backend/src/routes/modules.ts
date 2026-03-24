import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { AuthRequest } from '../types';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/modules
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, userId } = req.user!;

    const where: Record<string, unknown> = {};
    if (role === Role.FORMATEUR) {
      where.formateurId = userId;
    }

    const modules = await prisma.module_Formation.findMany({
      where,
      include: {
        formateur: { select: { id: true, nom: true, prenom: true } },
        _count: { select: { sessions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: modules });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /api/modules/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const module = await prisma.module_Formation.findUnique({
      where: { id: req.params.id },
      include: {
        formateur: { select: { id: true, nom: true, prenom: true } },
        sessions: {
          include: {
            apprenant: { select: { id: true, nom: true, prenom: true } },
          },
          orderBy: { dateDebut: 'desc' },
          take: 10,
        },
      },
    });

    if (!module) {
      res.status(404).json({ success: false, error: 'Module introuvable' });
      return;
    }

    res.json({ success: true, data: module });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/modules
router.post(
  '/',
  authenticateToken,
  requireRole(Role.FORMATEUR),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { nom, description } = req.body;

      if (!nom) {
        res.status(400).json({ success: false, error: 'Le nom du module est requis' });
        return;
      }

      const module = await prisma.module_Formation.create({
        data: {
          nom,
          description: description || null,
          formateurId: req.user!.userId,
        },
        include: {
          formateur: { select: { id: true, nom: true, prenom: true } },
        },
      });

      res.status(201).json({ success: true, data: module });
    } catch (error) {
      console.error('Create module error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

// PUT /api/modules/:id
router.put(
  '/:id',
  authenticateToken,
  requireRole(Role.FORMATEUR),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const existing = await prisma.module_Formation.findUnique({ where: { id: req.params.id } });

      if (!existing) {
        res.status(404).json({ success: false, error: 'Module introuvable' });
        return;
      }

      if (existing.formateurId !== req.user!.userId) {
        res.status(403).json({ success: false, error: 'Accès refusé' });
        return;
      }

      const { nom, description } = req.body;

      const module = await prisma.module_Formation.update({
        where: { id: req.params.id },
        data: {
          ...(nom && { nom }),
          ...(description !== undefined && { description }),
        },
        include: {
          formateur: { select: { id: true, nom: true, prenom: true } },
        },
      });

      res.json({ success: true, data: module });
    } catch (error) {
      console.error('Update module error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

// DELETE /api/modules/:id
router.delete(
  '/:id',
  authenticateToken,
  requireRole(Role.FORMATEUR),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const existing = await prisma.module_Formation.findUnique({ where: { id: req.params.id } });

      if (!existing) {
        res.status(404).json({ success: false, error: 'Module introuvable' });
        return;
      }

      if (existing.formateurId !== req.user!.userId) {
        res.status(403).json({ success: false, error: 'Accès refusé' });
        return;
      }

      await prisma.module_Formation.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Module supprimé' });
    } catch (error) {
      console.error('Delete module error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

export default router;
