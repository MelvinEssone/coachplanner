import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { AuthRequest } from '../types';
import { Role, SessionStatut } from '@prisma/client';

const router = Router();

// GET /api/dashboard/formateur
router.get(
  '/formateur',
  authenticateToken,
  requireRole(Role.FORMATEUR),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.user!;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalSessions,
        sessionsThisMonth,
        sessionsByStatus,
        totalApprenants,
        totalModules,
        upcomingSessions,
        recentSessions,
      ] = await Promise.all([
        prisma.session.count({ where: { formateurId: userId, archived: false } }),
        prisma.session.count({
          where: { formateurId: userId, archived: false, dateDebut: { gte: startOfMonth } },
        }),
        prisma.session.groupBy({
          by: ['statut'],
          where: { formateurId: userId, archived: false },
          _count: true,
        }),
        prisma.session.findMany({
          where: { formateurId: userId, archived: false },
          distinct: ['apprenantId'],
          select: { apprenantId: true },
        }),
        prisma.module_Formation.count({ where: { formateurId: userId } }),
        prisma.session.findMany({
          where: {
            formateurId: userId,
            archived: false,
            statut: SessionStatut.A_VENIR,
            dateDebut: { gte: now },
          },
          include: {
            apprenant: { select: { id: true, nom: true, prenom: true, avatar: true } },
            module: { select: { id: true, nom: true } },
          },
          orderBy: { dateDebut: 'asc' },
          take: 5,
        }),
        prisma.session.findMany({
          where: { formateurId: userId, archived: false },
          include: {
            apprenant: { select: { id: true, nom: true, prenom: true, avatar: true } },
            module: { select: { id: true, nom: true } },
            signatures: { select: { id: true, userId: true } },
          },
          orderBy: { dateDebut: 'desc' },
          take: 5,
        }),
      ]);

      const statusMap = Object.fromEntries(sessionsByStatus.map((s) => [s.statut, s._count]));

      res.json({
        success: true,
        data: {
          stats: {
            totalSessions,
            sessionsThisMonth,
            totalApprenants: totalApprenants.length,
            totalModules,
            aVenir: statusMap[SessionStatut.A_VENIR] || 0,
            enCours: statusMap[SessionStatut.EN_COURS] || 0,
            terminees: statusMap[SessionStatut.TERMINEE] || 0,
          },
          upcomingSessions,
          recentSessions,
        },
      });
    } catch (error) {
      console.error('Formateur dashboard error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

// GET /api/dashboard/apprenant
router.get(
  '/apprenant',
  authenticateToken,
  requireRole(Role.APPRENANT),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.user!;
      const now = new Date();

      const [
        totalSessions,
        sessionsSigned,
        upcomingSessions,
        recentSessions,
      ] = await Promise.all([
        prisma.session.count({ where: { apprenantId: userId, archived: false } }),
        prisma.signatureSession.count({ where: { userId } }),
        prisma.session.findMany({
          where: {
            apprenantId: userId,
            archived: false,
            statut: SessionStatut.A_VENIR,
            dateDebut: { gte: now },
          },
          include: {
            formateur: { select: { id: true, nom: true, prenom: true, avatar: true } },
            module: { select: { id: true, nom: true } },
            signatures: { select: { id: true, userId: true } },
          },
          orderBy: { dateDebut: 'asc' },
          take: 5,
        }),
        prisma.session.findMany({
          where: { apprenantId: userId, archived: false },
          include: {
            formateur: { select: { id: true, nom: true, prenom: true, avatar: true } },
            module: { select: { id: true, nom: true } },
            signatures: { select: { id: true, userId: true } },
          },
          orderBy: { dateDebut: 'desc' },
          take: 5,
        }),
      ]);

      const sessionsToSign = upcomingSessions.filter(
        (s) => !s.signatures.some((sig) => sig.userId === userId)
      );

      res.json({
        success: true,
        data: {
          stats: {
            totalSessions,
            sessionsSigned,
            sessionsToSign: sessionsToSign.length,
          },
          upcomingSessions,
          recentSessions,
          sessionsToSign,
        },
      });
    } catch (error) {
      console.error('Apprenant dashboard error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

// GET /api/dashboard/manager
router.get(
  '/manager',
  authenticateToken,
  requireRole(Role.MANAGER_RH),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.user!;

      const assignments = await prisma.assignment_Manager.findMany({
        where: { managerId: userId },
        include: {
          apprenant: {
            select: { id: true, nom: true, prenom: true, email: true, avatar: true },
          },
        },
      });

      const apprenantIds = assignments.map((a) => a.apprenantId);

      const [totalSessions, rapports, pendingRapports, recentSessions] = await Promise.all([
        prisma.session.count({ where: { apprenantId: { in: apprenantIds }, archived: false } }),
        prisma.rapport_Horaire.count({ where: { managerId: userId } }),
        prisma.rapport_Horaire.count({ where: { managerId: userId, statut: 'EN_ATTENTE' } }),
        prisma.session.findMany({
          where: { apprenantId: { in: apprenantIds }, archived: false },
          include: {
            apprenant: { select: { id: true, nom: true, prenom: true } },
            formateur: { select: { id: true, nom: true, prenom: true } },
            module: { select: { id: true, nom: true } },
          },
          orderBy: { dateDebut: 'desc' },
          take: 10,
        }),
      ]);

      res.json({
        success: true,
        data: {
          stats: {
            totalApprenants: apprenantIds.length,
            totalSessions,
            totalRapports: rapports,
            pendingRapports,
          },
          apprenants: assignments.map((a) => a.apprenant),
          recentSessions,
        },
      });
    } catch (error) {
      console.error('Manager dashboard error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

// GET /api/dashboard/responsable
router.get(
  '/responsable',
  authenticateToken,
  requireRole(Role.RESPONSABLE_CENTRE),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.user!;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const centreAssignments = await prisma.assignment_Centre.findMany({
        where: { responsableId: userId },
        select: { formateurId: true },
      });
      const formateurIds = centreAssignments.map((a) => a.formateurId);

      const [
        totalFormateurs,
        totalSessions,
        sessionsThisMonth,
        sessionsByStatus,
        formateurs,
      ] = await Promise.all([
        formateurIds.length,
        prisma.session.count({ where: { formateurId: { in: formateurIds }, archived: false } }),
        prisma.session.count({
          where: {
            formateurId: { in: formateurIds },
            archived: false,
            dateDebut: { gte: startOfMonth },
          },
        }),
        prisma.session.groupBy({
          by: ['statut'],
          where: { formateurId: { in: formateurIds }, archived: false },
          _count: true,
        }),
        prisma.user.findMany({
          where: { id: { in: formateurIds } },
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            avatar: true,
            formateurProfil: true,
            _count: { select: { sessions_formateur: true } },
          },
        }),
      ]);

      const statusMap = Object.fromEntries(sessionsByStatus.map((s) => [s.statut, s._count]));

      res.json({
        success: true,
        data: {
          stats: {
            totalFormateurs,
            totalSessions,
            sessionsThisMonth,
            aVenir: statusMap[SessionStatut.A_VENIR] || 0,
            enCours: statusMap[SessionStatut.EN_COURS] || 0,
            terminees: statusMap[SessionStatut.TERMINEE] || 0,
          },
          formateurs,
        },
      });
    } catch (error) {
      console.error('Responsable dashboard error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

export default router;
