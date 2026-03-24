import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { AuthRequest } from '../types';
import { Role, SessionStatut } from '@prisma/client';
import { sendSessionNotification } from '../lib/email';

const router = Router();

// GET /api/sessions
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, userId } = req.user!;
    const { statut, moduleId, apprenantId, formateurId, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { archived: false };

    if (role === Role.FORMATEUR) {
      where.formateurId = userId;
    } else if (role === Role.APPRENANT) {
      where.apprenantId = userId;
    } else if (role === Role.MANAGER_RH) {
      // Manager sees sessions of their assigned learners
      const assignments = await prisma.assignment_Manager.findMany({
        where: { managerId: userId },
        select: { apprenantId: true },
      });
      where.apprenantId = { in: assignments.map((a) => a.apprenantId) };
    }
    // RESPONSABLE_CENTRE can see all

    if (statut) where.statut = statut as SessionStatut;
    if (moduleId) where.moduleId = moduleId as string;
    if (apprenantId && role !== Role.APPRENANT) where.apprenantId = apprenantId as string;
    if (formateurId) where.formateurId = formateurId as string;

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        include: {
          formateur: { select: { id: true, nom: true, prenom: true, email: true, avatar: true } },
          apprenant: { select: { id: true, nom: true, prenom: true, email: true, avatar: true } },
          module: { select: { id: true, nom: true } },
          signatures: { select: { id: true, userId: true, horodatage: true } },
        },
        orderBy: { dateDebut: 'asc' },
        skip,
        take: limitNum,
      }),
      prisma.session.count({ where }),
    ]);

    res.json({
      success: true,
      data: sessions,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /api/sessions/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: {
        formateur: { select: { id: true, nom: true, prenom: true, email: true, avatar: true } },
        apprenant: { select: { id: true, nom: true, prenom: true, email: true, avatar: true } },
        module: true,
        signatures: {
          include: { user: { select: { id: true, nom: true, prenom: true, role: true } } },
        },
      },
    });

    if (!session) {
      res.status(404).json({ success: false, error: 'Session introuvable' });
      return;
    }

    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/sessions
router.post(
  '/',
  authenticateToken,
  requireRole(Role.FORMATEUR),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { apprenantId, moduleId, dateDebut, dateFin, type, notes } = req.body;

      if (!apprenantId || !moduleId || !dateDebut || !dateFin) {
        res.status(400).json({ success: false, error: 'Champs requis manquants' });
        return;
      }

      const start = new Date(dateDebut);
      const end = new Date(dateFin);
      const dureeMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

      const session = await prisma.session.create({
        data: {
          formateurId: req.user!.userId,
          apprenantId,
          moduleId,
          dateDebut: start,
          dateFin: end,
          dureeMinutes,
          type: type || 'individuelle',
          notes,
          statut: SessionStatut.A_VENIR,
        },
        include: {
          formateur: { select: { id: true, nom: true, prenom: true } },
          apprenant: { select: { id: true, nom: true, prenom: true, email: true } },
          module: { select: { id: true, nom: true } },
        },
      });

      // Create notification for apprenant
      await prisma.notification.create({
        data: {
          destinataireId: apprenantId,
          type: 'NOUVELLE_SESSION',
          message: `Nouvelle session planifiée : ${session.module.nom} le ${start.toLocaleDateString('fr-FR')}`,
        },
      });

      // Send email notification
      sendSessionNotification(
        session.apprenant.email,
        session.apprenant.prenom,
        session.module.nom,
        start
      ).catch(console.error);

      res.status(201).json({ success: true, data: session });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

// PUT /api/sessions/:id
router.put(
  '/:id',
  authenticateToken,
  requireRole(Role.FORMATEUR),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { dateDebut, dateFin, type, notes, statut } = req.body;

      const existing = await prisma.session.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Session introuvable' });
        return;
      }

      if (existing.formateurId !== req.user!.userId) {
        res.status(403).json({ success: false, error: 'Accès refusé' });
        return;
      }

      const updateData: Record<string, unknown> = {};
      if (dateDebut) updateData.dateDebut = new Date(dateDebut);
      if (dateFin) updateData.dateFin = new Date(dateFin);
      if (type) updateData.type = type;
      if (notes !== undefined) updateData.notes = notes;
      if (statut) updateData.statut = statut as SessionStatut;

      if (dateDebut && dateFin) {
        const start = new Date(dateDebut);
        const end = new Date(dateFin);
        updateData.dureeMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      }

      const session = await prisma.session.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          formateur: { select: { id: true, nom: true, prenom: true } },
          apprenant: { select: { id: true, nom: true, prenom: true, email: true } },
          module: { select: { id: true, nom: true } },
        },
      });

      res.json({ success: true, data: session });
    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

// DELETE /api/sessions/:id - Soft delete
router.delete(
  '/:id',
  authenticateToken,
  requireRole(Role.FORMATEUR),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const existing = await prisma.session.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Session introuvable' });
        return;
      }

      if (existing.formateurId !== req.user!.userId) {
        res.status(403).json({ success: false, error: 'Accès refusé' });
        return;
      }

      await prisma.session.update({
        where: { id: req.params.id },
        data: { archived: true },
      });

      res.json({ success: true, message: 'Session archivée' });
    } catch (error) {
      console.error('Delete session error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

export default router;
