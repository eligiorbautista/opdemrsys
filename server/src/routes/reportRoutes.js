const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/daily-summary', ReportController.getDailySummary);
router.get('/patient-statistics', ReportController.getPatientStatistics);
router.get('/consultations', ReportController.getConsultationReport);
router.get('/prescriptions', ReportController.getPrescriptionReport);
router.get('/visits', ReportController.getVisitReport);
router.get('/queue', ReportController.getQueueReport);
router.get('/overview', ReportController.getOverview);

module.exports = router;
