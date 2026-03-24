import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { AuthRequest } from '../types';
import { Role } from '@prisma/client';

const router = Router();

// POST /api/assignments/manager - Assign learner to manager
router.post(
  '/manager',
  authenticateToken,
  requireRole(Role.MANAGER_RH, Role.RESPONSABLE_CENTRE),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { managerId, apprenantId } = req.body;
      const { userId, role } = req.user!;

      // Manager can only assign to themselves
      const targetManagerId = role === Role.MANAGER_RH ? userId : managerId;

      if (!targetManagerId || !apprenantId) {
        res.status(400).json({ success: false, error: 'Manager ID et Apprenant ID requis' });
        return;
      }

      const assignment = await prisma.assignment_Manager.create({
        data: { managerId: targetManagerId, apprenantId },
        include: {
          manager: { select: { id: true, nom: true, prenom: true } },
          apprenant: { select: { id: true, nom: true, prenom: true } },
        },
      });

      res.status(201).json({ success: true, data: assignment });
    } catch (error: unknown) {
      if ((error as { code?: string }).code === 'P2002') {
        res.status(409).json({ success: false, error: 'Assignation déjà existante' });
        return;
      }
      console.error('Create manager assignment error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

// DELETE /api/assignments/manager
router.delete(
  '/manager',
  authenticateToken,
  requireRole(Role.MANAGER_RH, Role.RESPONSABLE_CENTRE),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { managerId, apprenantId } = req.body;
      const { userId, role } = req.user!;

      const targetManagerId = role === Role.MANAGER_RH ? userId : managerId;

      await prisma.assignment_Manager.delete({
        where: { managerId_apprenantId: { managerId: targetManagerId, apprenantId } },
      });

      res.json({ success: true, message: 'Assignation supprimée' });
    } catch (error) {
      console.error('Delete manager assignment error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

// GET /api/assignments/manager - Get manager assignments
router.get(
  '/manager',
  authenticateToken,
  requireRole(Role.MANAGER_RH, Role.RESPONSABLE_CENTRE),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId, role } = req.user!;
      const { managerId: filterManagerId } = req.query;

      const where: Record<string, unknown> = {};
      if (role === Role.MANAGER_RH) {
        where.managerId = userId;
      } else if (filterManagerId) {
        where.managerId = filterManagerId as string;
      }

      const assignments = await prisma.assignment_Manager.findMany({
        where,
        include: {
          manager: { select: { id: true, nom: true, prenom: true, email: true } },
          apprenant: { select: { id: true, nom: true, prenom: true, email: true } },
        },
      });

      res.json({ success: true, data: assignments });
    } catch (error) {
      console.error('Get manager assignments error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

// POST /api/assignments/centre - Assign trainer to centre manager
router.post(
  '/centre',
  authenticateToken,
  requireRole(Role.RESPONSABLE_CENTRE),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { formateurId } = req.body;
      const { userId } = req.user!;

      if (!formateurId) {
        res.status(400).json({ success: false, error: 'Formateur ID requis' });
        return;
      }

      const assignment = await prisma.assignment_Centre.create({
        data: { responsableId: userId, formateurId },
        include: {
          responsable: { select: { id: true, nom: true, prenom: true } },
          formateur: { select: { id: true, nom: true, prenom: true } },
        },
      });

      res.status(201).json({ success: true, data: assignment });
    } catch (error: unknown) {
      if ((error as { code?: string }).code === 'P2002') {
        res.status(409).json({ success: false, error: 'Assignation déjà existante' });
        return;
      }
      console.error('Create centre assignment error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

// DELETE /api/assignments/centre
router.delete(
  '/centre',
  authenticateToken,
  requireRole(Role.RESPONSABLE_CENTRE),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { formateurId } = req.body;
      const { userId } = req.user!;

      await prisma.assignment_Centre.delete({
        where: { responsableId_formateurId: { responsableId: userId, formateurId } },
      });

      res.json({ success: true, message: 'Assignation supprimée' });
    } catch (error) {
      console.error('Delete centre assignment error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

// GET /api/assignments/centre
router.get(
  '/centre',
  authenticateToken,
  requireRole(Role.RESPONSABLE_CENTRE),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.user!;

      const assignments = await prisma.assignment_Centre.findMany({
        where: { responsableId: userId },
        include: {
          formateur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              formateurProfil: true,
              _count: { select: { sessions_formateur: true } },
            },
          },
        },
      });

      res.json({ success: true, data: assignments });
    } catch (error) {
      console.error('Get centre assignments error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

export default router;
