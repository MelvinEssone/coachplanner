-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FORMATEUR', 'APPRENANT', 'MANAGER_RH', 'RESPONSABLE_CENTRE');

-- CreateEnum
CREATE TYPE "SessionStatut" AS ENUM ('A_VENIR', 'EN_COURS', 'TERMINEE');

-- CreateEnum
CREATE TYPE "RapportStatut" AS ENUM ('EN_ATTENTE', 'SIGNE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "FrequenceRapport" AS ENUM ('HEBDOMADAIRE', 'MENSUELLE', 'MANUELLE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'APPRENANT',
    "avatar" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "resetToken" TEXT,
    "resetTokenExp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entrepriseId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entreprise" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "adresse" TEXT,
    "siret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entreprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module_Formation" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "formateurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_Formation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "formateurId" TEXT NOT NULL,
    "apprenantId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "dureeMinutes" INTEGER NOT NULL,
    "type" TEXT,
    "statut" "SessionStatut" NOT NULL DEFAULT 'A_VENIR',
    "notes" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignatureSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "signatureData" TEXT NOT NULL,
    "horodatage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "pdfUrl" TEXT,

    CONSTRAINT "SignatureSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rapport_Horaire" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "apprenantId" TEXT NOT NULL,
    "periodeDebut" TIMESTAMP(3) NOT NULL,
    "periodeFin" TIMESTAMP(3) NOT NULL,
    "statut" "RapportStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rapport_Horaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signature_Rapport" (
    "id" TEXT NOT NULL,
    "rapportId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "signatureData" TEXT NOT NULL,
    "horodatage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "Signature_Rapport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagerSettings" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "frequenceRapport" "FrequenceRapport" NOT NULL DEFAULT 'MENSUELLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment_Manager" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "apprenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_Manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment_Centre" (
    "id" TEXT NOT NULL,
    "responsableId" TEXT NOT NULL,
    "formateurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_Centre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormateurProfil" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matieres" TEXT[],
    "statut" TEXT NOT NULL DEFAULT 'Actif',
    "dateEntree" TIMESTAMP(3),
    "telephone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormateurProfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "destinataireId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SignatureSession_sessionId_userId_key" ON "SignatureSession"("sessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Signature_Rapport_rapportId_key" ON "Signature_Rapport"("rapportId");

-- CreateIndex
CREATE UNIQUE INDEX "ManagerSettings_managerId_key" ON "ManagerSettings"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_Manager_managerId_apprenantId_key" ON "Assignment_Manager"("managerId", "apprenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_Centre_responsableId_formateurId_key" ON "Assignment_Centre"("responsableId", "formateurId");

-- CreateIndex
CREATE UNIQUE INDEX "FormateurProfil_userId_key" ON "FormateurProfil"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module_Formation" ADD CONSTRAINT "Module_Formation_formateurId_fkey" FOREIGN KEY ("formateurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_formateurId_fkey" FOREIGN KEY ("formateurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_apprenantId_fkey" FOREIGN KEY ("apprenantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module_Formation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureSession" ADD CONSTRAINT "SignatureSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureSession" ADD CONSTRAINT "SignatureSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rapport_Horaire" ADD CONSTRAINT "Rapport_Horaire_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rapport_Horaire" ADD CONSTRAINT "Rapport_Horaire_apprenantId_fkey" FOREIGN KEY ("apprenantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signature_Rapport" ADD CONSTRAINT "Signature_Rapport_rapportId_fkey" FOREIGN KEY ("rapportId") REFERENCES "Rapport_Horaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signature_Rapport" ADD CONSTRAINT "Signature_Rapport_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagerSettings" ADD CONSTRAINT "ManagerSettings_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment_Manager" ADD CONSTRAINT "Assignment_Manager_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment_Manager" ADD CONSTRAINT "Assignment_Manager_apprenantId_fkey" FOREIGN KEY ("apprenantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment_Centre" ADD CONSTRAINT "Assignment_Centre_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment_Centre" ADD CONSTRAINT "Assignment_Centre_formateurId_fkey" FOREIGN KEY ("formateurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormateurProfil" ADD CONSTRAINT "FormateurProfil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_destinataireId_fkey" FOREIGN KEY ("destinataireId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
