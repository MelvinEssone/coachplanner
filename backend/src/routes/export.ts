import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { AuthRequest } from '../types';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/export/csv - Export CSV
router.get(
  '/csv',
  authenticateToken,
  requireRole(Role.RESPONSABLE_CENTRE, Role.MANAGER_RH),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId, role } = req.user!;
      const { type = 'sessions', from, to } = req.query;

      const dateFilter: Record<string, unknown> = {};
      if (from) dateFilter.gte = new Date(from as string);
      if (to) dateFilter.lte = new Date(to as string);

      let csvContent = '';

      if (type === 'sessions') {
        const where: Record<string, unknown> = { archived: false };
        if (Object.keys(dateFilter).length > 0) where.dateDebut = dateFilter;

        if (role === Role.MANAGER_RH) {
          const assignments = await prisma.assignment_Manager.findMany({
            where: { managerId: userId },
            select: { apprenantId: true },
          });
          where.apprenantId = { in: assignments.map((a) => a.apprenantId) };
        }

        const sessions = await prisma.session.findMany({
          where,
          include: {
            formateur: { select: { nom: true, prenom: true, email: true } },
            apprenant: { select: { nom: true, prenom: true, email: true } },
            module: { select: { nom: true } },
          },
          orderBy: { dateDebut: 'desc' },
        });

        const headers = ['ID', 'Module', 'Formateur', 'Apprenant', 'Date début', 'Date fin', 'Durée (min)', 'Type', 'Statut'];
        const rows = sessions.map((s) => [
          s.id,
          s.module.nom,
          `${s.formateur.prenom} ${s.formateur.nom}`,
          `${s.apprenant.prenom} ${s.apprenant.nom}`,
          s.dateDebut.toISOString(),
          s.dateFin.toISOString(),
          s.dureeMinutes.toString(),
          s.type || '',
          s.statut,
        ]);

        csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
      } else if (type === 'formateurs') {
        const formateurs = await prisma.user.findMany({
          where: { role: Role.FORMATEUR },
          include: {
            formateurProfil: true,
            _count: { select: { sessions_formateur: true } },
          },
          orderBy: { nom: 'asc' },
        });

        const headers = ['ID', 'Nom', 'Prénom', 'Email', 'Statut', 'Matières', 'Nb Sessions'];
        const rows = formateurs.map((f) => [
          f.id,
          f.nom,
          f.prenom,
          f.email,
          f.formateurProfil?.statut || '',
          (f.formateurProfil?.matieres || []).join('; '),
          f._count.sessions_formateur.toString(),
        ]);

        csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="export-${type}-${Date.now()}.csv"`);
      res.send('\ufeff' + csvContent); // BOM for Excel
    } catch (error) {
      console.error('CSV export error:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
);

export default router;
