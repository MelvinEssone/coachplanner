import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import sessionsRoutes from './routes/sessions';
import modulesRoutes from './routes/modules';
import usersRoutes from './routes/users';
import entreprisesRoutes from './routes/entreprises';
import notificationsRoutes from './routes/notifications';
import signaturesRoutes from './routes/signatures';
import rapportsRoutes from './routes/rapports';
import assignmentsRoutes from './routes/assignments';
import dashboardRoutes from './routes/dashboard';
import exportRoutes from './routes/export';

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, error: 'Trop de requêtes, veuillez réessayer plus tard' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' })); // 10mb for base64 signatures
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/entreprises', entreprisesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/signatures', signaturesRoutes);
app.use('/api/rapports', rapportsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route introuvable' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log(`🚀 CoachPlanner API running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
