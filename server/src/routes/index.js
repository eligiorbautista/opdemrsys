const prisma = require('../config/database');

const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const patientRoutes = require('./patientRoutes');
const consultationRoutes = require('./consultationRoutes');
const prescriptionRoutes = require('./prescriptionRoutes');
const queueRoutes = require('./queueRoutes');
const publicRoutes = require('./publicRoutes');
const visitRoutes = require('./visitRoutes');
const nurseRoutes = require('./nurseRoutes');
const reportRoutes = require('./reportRoutes');
const auditRoutes = require('./auditRoutes');
const orderRoutes = require('./orderRoutes');

module.exports = (app) => {
  app.use(healthRoutes);
  app.use('/api/auth', authRoutes);
  
  // Public routes (no authentication)
  app.use('/api/public', publicRoutes);
  
  // Protected routes
  app.use('/api/users', userRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/consultations', consultationRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/visits', visitRoutes);
  app.use('/api/nurse-documentation', nurseRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api', orderRoutes);
};