import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { authenticateToken } from '../middleware/auth';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../lib/email';
import { AuthRequest } from '../types';
import { Role } from '@prisma/client';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom, prenom, email, password, role, entrepriseId } = req.body;

    if (!nom || !prenom || !email || !password) {
      res.status(400).json({ success: false, error: 'Champs requis manquants' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ success: false, error: 'Email déjà utilisé' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userRole: Role = (role as Role) || Role.APPRENANT;

    const user = await prisma.user.create({
      data: {
        nom,
        prenom,
        email,
        passwordHash,
        role: userRole,
        entrepriseId: entrepriseId || null,
        emailVerified: true, // simplified for demo
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Create FormateurProfil if role is FORMATEUR
    if (userRole === Role.FORMATEUR) {
      await prisma.formateurProfil.create({
        data: { userId: user.id, matieres: [], statut: 'Actif' },
      });
    }

    // Create ManagerSettings if role is MANAGER_RH
    if (userRole === Role.MANAGER_RH) {
      await prisma.managerSettings.create({
        data: { managerId: user.id },
      });
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    await sendWelcomeEmail(email, prenom).catch(console.error);

    res.status(201).json({
      success: true,
      data: { user, accessToken, refreshToken },
      message: 'Compte créé avec succès',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email et mot de passe requis' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { entreprise: true, formateurProfil: true },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' });
      return;
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const { passwordHash, resetToken, resetTokenExp, ...safeUser } = user;

    res.json({
      success: true,
      data: { user: safeUser, accessToken, refreshToken },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, error: 'Refresh token manquant' });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      res.status(401).json({ success: false, error: 'Utilisateur introuvable' });
      return;
    }

    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
  } catch {
    res.status(403).json({ success: false, error: 'Refresh token invalide' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        entreprise: true,
        formateurProfil: true,
        managerSettings: true,
      },
      // omit passwordHash
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
      return;
    }

    const { passwordHash, resetToken, resetTokenExp, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nom, prenom, avatar, entrepriseId } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(nom && { nom }),
        ...(prenom && { prenom }),
        ...(avatar !== undefined && { avatar }),
        ...(entrepriseId !== undefined && { entrepriseId }),
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        avatar: true,
        entrepriseId: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: 'Email requis' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      res.json({ success: true, message: 'Si cet email existe, un lien de réinitialisation a été envoyé' });
      return;
    }

    const resetToken = uuidv4();
    const resetTokenExp = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    await sendPasswordResetEmail(email, resetToken).catch(console.error);

    res.json({ success: true, message: 'Si cet email existe, un lien de réinitialisation a été envoyé' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ success: false, error: 'Token et mot de passe requis' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gt: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({ success: false, error: 'Token invalide ou expiré' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExp: null },
    });

    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

export default router;
