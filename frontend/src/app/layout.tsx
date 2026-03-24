import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoachPlanner - Gestion de formations",
  description: "Plateforme de gestion des sessions de coaching et formations professionnelles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
