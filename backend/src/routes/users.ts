import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/users
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, userId } = req.user!;
    const { role: filterRole, search } = req.query;

    const where: Record<string, unknown> = {};

    if (filterRole) {
      where.role = filterRole as Role;
    }

    if (search) {
      where.OR = [
        { nom: { contains: search as string, mode: 'insensitive' } },
        { prenom: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Role-based filtering
    if (role === Role.FORMATEUR) {
      // Formateur sees apprenants only
      where.role = Role.APPRENANT;
    } else if (role === Role.MANAGER_RH) {
      // Manager sees their assigned apprenants (or all apprenants)
      where.role = Role.APPRENANT;
    }
    // RESPONSABLE_CENTRE and ADMIN see all

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        entreprise: { select: { id: true, nom: true } },
        formateurProfil: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /api/users/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        entreprise: { select: { id: true, nom: true } },
        formateurProfil: true,
        managerSettings: true,
        _count: {
          select: {
            sessions_formateur: true,
            sessions_apprenant: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

export default router;
