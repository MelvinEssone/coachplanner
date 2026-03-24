import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { AuthRequest } from '../types';
import { Role, RapportStatut } from '@prisma/client';

const router = Router();

// GET /api/rapports
router.get(
  '/',
  authenticateToken,
  requireRole(Role.MANAGER_RH, Role.RESPONSABLE_CENTRE),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId, role } = req.user!;
      const { statut, apprenantId } = req.query;

      const where: Record<string, unknown> = {};

      if (role === Role.MANAGER_RH) {
        where.managerId = userId;
      }

      if (statut) where.statut = statut as RapportStatut;
      if (apprenantId) where.apprenantId = apprenantId as string;

      const rapports = await prisma.rapport_Horaire.findMany({
        where,
        include: {
          manager: { select: { id: true, nom: true, prenom: true } },
          apprenant: { select: { id: true, nom: true, prenom: true, email: true } },
          signature: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: rapports });
    } catch (error) {
      console.error('Get rapports error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

// GET /api/rapports/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rapport = await prisma.rapport_Horaire.findUnique({
      where: { id: req.params.id },
      include: {
        manager: { select: { id: true, nom: true, prenom: true, email: true } },
        apprenant: { select: { id: true, nom: true, prenom: true, email: true, entreprise: true } },
        signature: true,
      },
    });

    if (!rapport) {
      res.status(404).json({ success: false, error: 'Rapport introuvable' });
      return;
    }

    res.json({ success: true, data: rapport });
  } catch (error) {
    console.error('Get rapport error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/rapports/generate
router.post(
  '/generate',
  authenticateToken,
  requireRole(Role.MANAGER_RH),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { apprenantId, periodeDebut, periodeFin } = req.body;
      const { userId } = req.user!;

      if (!apprenantId || !periodeDebut || !periodeFin) {
        res.status(400).json({ success: false, error: 'Champs requis manquants' });
        return;
      }

      // Check assignment
      const assignment = await prisma.assignment_Manager.findUnique({
        where: { managerId_apprenantId: { managerId: userId, apprenantId } },
      });

      if (!assignment) {
        res.status(403).json({ success: false, error: 'Apprenant non assigné à ce manager' });
        return;
      }

      const rapport = await prisma.rapport_Horaire.create({
        data: {
          managerId: userId,
          apprenantId,
          periodeDebut: new Date(periodeDebut),
          periodeFin: new Date(periodeFin),
          statut: RapportStatut.EN_ATTENTE,
        },
        include: {
          manager: { select: { id: true, nom: true, prenom: true } },
          apprenant: { select: { id: true, nom: true, prenom: true } },
        },
      });

      // Notify apprenant
      await prisma.notification.create({
        data: {
          destinataireId: apprenantId,
          type: 'RAPPORT_GENERE',
          message: `Un nouveau rapport horaire a été généré pour la période du ${new Date(periodeDebut).toLocaleDateString('fr-FR')} au ${new Date(periodeFin).toLocaleDateString('fr-FR')}`,
        },
      });

      res.status(201).json({ success: true, data: rapport });
    } catch (error) {
      console.error('Generate rapport error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

// GET /api/rapports/:id/pdf - Download report PDF
router.get('/:id/pdf', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rapport = await prisma.rapport_Horaire.findUnique({
      where: { id: req.params.id },
      include: {
        manager: { select: { id: true, nom: true, prenom: true, email: true } },
        apprenant: {
          select: { id: true, nom: true, prenom: true, email: true, entreprise: true },
        },
        signature: true,
      },
    });

    if (!rapport) {
      res.status(404).json({ success: false, error: 'Rapport introuvable' });
      return;
    }

    // Get sessions for the period
    const sessions = await prisma.session.findMany({
      where: {
        apprenantId: rapport.apprenantId,
        dateDebut: {
          gte: rapport.periodeDebut,
          lte: rapport.periodeFin,
        },
        archived: false,
      },
      include: {
        module: { select: { nom: true } },
        formateur: { select: { nom: true, prenom: true } },
      },
      orderBy: { dateDebut: 'asc' },
    });

    const totalHeures = sessions.reduce((acc, s) => acc + s.dureeMinutes, 0) / 60;

    // Generate simple PDF response as JSON for now (PDF generation would use pdfkit in production)
    const pdfData = {
      rapport,
      sessions,
      totalHeures: totalHeures.toFixed(2),
      generatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: pdfData });
  } catch (error) {
    console.error('Get rapport PDF error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

export default router;
