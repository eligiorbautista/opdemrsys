const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');

// Lab Orders
router.get('/lab-orders/patient/:id', authenticate, OrderController.getLabOrdersByPatient);
router.post('/lab-orders', authenticate, OrderController.createLabOrder);
router.put('/lab-orders/:id', authenticate, OrderController.updateLabOrder);

// Procedure Orders
router.get('/procedure-orders/patient/:id', authenticate, OrderController.getProcedureOrdersByPatient);
router.post('/procedure-orders', authenticate, OrderController.createProcedureOrder);
router.put('/procedure-orders/:id', authenticate, OrderController.updateProcedureOrder);

// Follow-up Orders
router.get('/follow-up-orders/patient/:id', authenticate, OrderController.getFollowUpOrdersByPatient);
router.post('/follow-up-orders', authenticate, OrderController.createFollowUpOrder);
router.put('/follow-up-orders/:id', authenticate, OrderController.updateFollowUpOrder);

// Nursing Orders
router.get('/nursing-orders/patient/:id', authenticate, OrderController.getNursingOrdersByPatient);
router.post('/nursing-orders', authenticate, OrderController.createNursingOrder);
router.put('/nursing-orders/:id', authenticate, OrderController.updateNursingOrder);

// Referral Orders
router.get('/referral-orders/patient/:id', authenticate, OrderController.getReferralOrdersByPatient);
router.post('/referral-orders', authenticate, OrderController.createReferralOrder);
router.put('/referral-orders/:id', authenticate, OrderController.updateReferralOrder);

module.exports = router;
