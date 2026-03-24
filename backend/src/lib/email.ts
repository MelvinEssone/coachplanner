import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'CoachPlanner <noreply@coachplanner.fr>',
    to,
    subject,
    html,
  });
}

export async function sendWelcomeEmail(email: string, prenom: string): Promise<void> {
  await sendEmail(
    email,
    'Bienvenue sur CoachPlanner',
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3B82F6;">Bienvenue sur CoachPlanner, ${prenom} !</h1>
      <p>Votre compte a été créé avec succès.</p>
      <p>Vous pouvez maintenant vous connecter à la plateforme et commencer à utiliser toutes les fonctionnalités disponibles.</p>
      <a href="${process.env.FRONTEND_URL}/login"
         style="display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
        Se connecter
      </a>
      <p style="margin-top: 24px; color: #6B7280; font-size: 14px;">L'équipe CoachPlanner</p>
    </div>
    `
  );
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendEmail(
    email,
    'Réinitialisation de votre mot de passe',
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3B82F6;">Réinitialisation de mot de passe</h1>
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien est valable 1 heure.</p>
      <a href="${resetUrl}"
         style="display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
        Réinitialiser mon mot de passe
      </a>
      <p style="margin-top: 16px; color: #6B7280; font-size: 14px;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    </div>
    `
  );
}

export async function sendSessionNotification(
  email: string,
  prenom: string,
  sessionTitle: string,
  dateDebut: Date
): Promise<void> {
  await sendEmail(
    email,
    `Nouvelle session planifiée : ${sessionTitle}`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3B82F6;">Nouvelle session planifiée</h1>
      <p>Bonjour ${prenom},</p>
      <p>Une nouvelle session a été planifiée pour vous :</p>
      <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Module :</strong> ${sessionTitle}</p>
        <p><strong>Date :</strong> ${dateDebut.toLocaleDateString('fr-FR', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })}</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/apprenant/agenda"
         style="display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px;">
        Voir mon agenda
      </a>
    </div>
    `
  );
}
