import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// GET /api/entreprises
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const entreprises = await prisma.entreprise.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { nom: 'asc' },
    });
    res.json({ success: true, data: entreprises });
  } catch (error) {
    console.error('Get entreprises error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /api/entreprises/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: req.params.id },
      include: {
        users: {
          select: { id: true, nom: true, prenom: true, email: true, role: true },
        },
      },
    });

    if (!entreprise) {
      res.status(404).json({ success: false, error: 'Entreprise introuvable' });
      return;
    }

    res.json({ success: true, data: entreprise });
  } catch (error) {
    console.error('Get entreprise error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/entreprises
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nom, type, adresse, siret } = req.body;

    if (!nom || !type) {
      res.status(400).json({ success: false, error: 'Nom et type requis' });
      return;
    }

    const entreprise = await prisma.entreprise.create({
      data: { nom, type, adresse: adresse || null, siret: siret || null },
    });

    res.status(201).json({ success: true, data: entreprise });
  } catch (error) {
    console.error('Create entreprise error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PUT /api/entreprises/:id
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nom, type, adresse, siret } = req.body;

    const entreprise = await prisma.entreprise.update({
      where: { id: req.params.id },
      data: {
        ...(nom && { nom }),
        ...(type && { type }),
        ...(adresse !== undefined && { adresse }),
        ...(siret !== undefined && { siret }),
      },
    });

    res.json({ success: true, data: entreprise });
  } catch (error) {
    console.error('Update entreprise error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

export default router;
