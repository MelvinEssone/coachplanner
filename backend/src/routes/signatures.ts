import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { AuthRequest } from '../types';
import { Role, SessionStatut, RapportStatut } from '@prisma/client';

const router = Router();

// POST /api/signatures/session - Sign a session (Apprenant or Formateur)
router.post('/session', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId, signatureData } = req.body;
    const { userId } = req.user!;

    if (!sessionId || !signatureData) {
      res.status(400).json({ success: false, error: 'Session ID et signature requis' });
      return;
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { module: true, formateur: { select: { id: true, nom: true, prenom: true } } },
    });

    if (!session) {
      res.status(404).json({ success: false, error: 'Session introuvable' });
      return;
    }

    // Check user is either formateur or apprenant of this session
    if (session.formateurId !== userId && session.apprenantId !== userId) {
      res.status(403).json({ success: false, error: 'Accès refusé' });
      return;
    }

    // Check if already signed
    const existing = await prisma.signatureSession.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });

    if (existing) {
      res.status(409).json({ success: false, error: 'Session déjà signée par cet utilisateur' });
      return;
    }

    const signature = await prisma.signatureSession.create({
      data: {
        sessionId,
        userId,
        signatureData,
        ipAddress: req.ip,
      },
    });

    // Check if both parties have signed - update session to TERMINEE
    const allSignatures = await prisma.signatureSession.count({ where: { sessionId } });
    if (allSignatures >= 2) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { statut: SessionStatut.TERMINEE },
      });
    } else {
      // Mark EN_COURS if at least one signature
      await prisma.session.update({
        where: { id: sessionId },
        data: { statut: SessionStatut.EN_COURS },
      });
    }

    // Notify the other party
    const notifyId = session.formateurId === userId ? session.apprenantId : session.formateurId;
    await prisma.notification.create({
      data: {
        destinataireId: notifyId,
        type: 'SESSION_SIGNEE',
        message: `La session "${session.module.nom}" a été signée`,
      },
    });

    res.status(201).json({ success: true, data: signature });
  } catch (error) {
    console.error('Sign session error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/signatures/rapport - Sign a rapport (Manager)
router.post(
  '/rapport',
  authenticateToken,
  requireRole(Role.MANAGER_RH),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { rapportId, signatureData } = req.body;
      const { userId } = req.user!;

      if (!rapportId || !signatureData) {
        res.status(400).json({ success: false, error: 'Rapport ID et signature requis' });
        return;
      }

      const rapport = await prisma.rapport_Horaire.findUnique({
        where: { id: rapportId },
        include: { apprenant: { select: { id: true, nom: true, prenom: true } } },
      });

      if (!rapport) {
        res.status(404).json({ success: false, error: 'Rapport introuvable' });
        return;
      }

      if (rapport.managerId !== userId) {
        res.status(403).json({ success: false, error: 'Accès refusé' });
        return;
      }

      const existing = await prisma.signature_Rapport.findUnique({ where: { rapportId } });
      if (existing) {
        res.status(409).json({ success: false, error: 'Rapport déjà signé' });
        return;
      }

      const signature = await prisma.signature_Rapport.create({
        data: {
          rapportId,
          managerId: userId,
          signatureData,
          ipAddress: req.ip,
        },
      });

      await prisma.rapport_Horaire.update({
        where: { id: rapportId },
        data: { statut: RapportStatut.SIGNE },
      });

      // Notify apprenant
      await prisma.notification.create({
        data: {
          destinataireId: rapport.apprenantId,
          type: 'RAPPORT_SIGNE',
          message: `Votre rapport horaire a été signé par votre manager`,
        },
      });

      res.status(201).json({ success: true, data: signature });
    } catch (error) {
      console.error('Sign rapport error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

export default router;
