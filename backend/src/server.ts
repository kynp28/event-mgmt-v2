import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import organizerRequestRoutes from './modules/organizer-request/organizer-request.routes';
import eventRoutes from './modules/event/event.routes';
import boothRoutes from './modules/booth/booth.routes';
import bookingRoutes from './modules/booking/booking.routes';
import paymentRoutes from './modules/payment/payment.routes';
import penaltyRoutes from './modules/penalty/penalty.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import waitlistRoutes from './modules/waitlist/waitlist.routes';
import adminRoutes from './modules/admin/admin.routes';
import { errorHandler } from './common/middleware/errorHandler';

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizer-requests', organizerRequestRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/layout', boothRoutes); // Group zones and booths under /layout
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/penalties', penaltyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/admin', adminRoutes);

// Error handler — ต้องอยู่หลัง routes เสมอ
app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 5000);
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});