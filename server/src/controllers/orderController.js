const prisma = require('../config/database');

class OrderController {
  // Lab Orders
  static async getLabOrdersByPatient(req, res) {
    try {
      const { id } = req.params;
      const orders = await prisma.labOrder.findMany({
        where: { patientId: id },
        include: {
          visit: {
            include: {
              nurseDocumentation: true
            }
          }
        },
        orderBy: { orderedDate: 'desc' }
      });

      return res.json({ success: true, data: orders });
    } catch (error) {
      console.error('Error fetching lab orders:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch lab orders' });
    }
  }

  static async createLabOrder(req, res) {
    try {
      const { patientId, visitId, type, category, description, priority, instructions } = req.body;

      const order = await prisma.labOrder.create({
        data: {
          patientId,
          visitId,
          orderedBy: req.user.id,
          type,
          category: category || 'Laboratory',
          description,
          priority: priority || 'ROUTINE',
          status: 'PENDING',
          orderedDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          instructions
        }
      });

      return res.json({ success: true, data: order });
    } catch (error) {
      console.error('Error creating lab order:', error);
      return res.status(500).json({ success: false, error: 'Failed to create lab order' });
    }
  }

  static async updateLabOrder(req, res) {
    try {
      const { id } = req.params;
      const { status, completedDate, results } = req.body;

      const order = await prisma.labOrder.update({
        where: { id },
        data: {
          status,
          completedDate,
          results
        }
      });

      return res.json({ success: true, data: order });
    } catch (error) {
      console.error('Error updating lab order:', error);
      return res.status(500).json({ success: false, error: 'Failed to update lab order' });
    }
  }

  // Procedure Orders
  static async getProcedureOrdersByPatient(req, res) {
    try {
      const { id } = req.params;
      const orders = await prisma.procedureOrder.findMany({
        where: {
          consultation: {
            patientId: id
          }
        },
        include: {
          consultation: {
            include: {
              patient: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json({ success: true, data: orders });
    } catch (error) {
      console.error('Error fetching procedure orders:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch procedure orders' });
    }
  }

  static async createProcedureOrder(req, res) {
    try {
      const { patientId, visitId, type, category, description, priority, instructions } = req.body;

      const order = await prisma.procedureOrder.create({
        data: {
          patientId,
          visitId,
          orderedBy: req.user.id,
          type,
          category: category || 'Nursing Procedure',
          description,
          priority: priority || 'ROUTINE',
          status: 'PENDING',
          scheduledDate: new Date().toISOString(),
          instructions
        }
      });

      return res.json({ success: true, data: order });
    } catch (error) {
      console.error('Error creating procedure order:', error);
      return res.status(500).json({ success: false, error: 'Failed to create procedure order' });
    }
  }

  static async updateProcedureOrder(req, res) {
    try {
      const { id } = req.params;
      const { status, completedDate, results } = req.body;

      const order = await prisma.procedureOrder.update({
        where: { id },
        data: {
          status,
          completedDate,
          results
        }
      });

      return res.json({ success: true, data: order });
    } catch (error) {
      console.error('Error updating procedure order:', error);
      return res.status(500).json({ success: false, error: 'Failed to update procedure order' });
    }
  }

  // Follow-up Orders
  static async getFollowUpOrdersByPatient(req, res) {
    try {
      const { id } = req.params;
      const orders = await prisma.followUpOrder.findMany({
        where: { patientId: id },
        include: {
          visit: true
        },
        orderBy: { followUpDate: 'desc' }
      });

      return res.json({ success: true, data: orders });
    } catch (error) {
      console.error('Error fetching follow-up orders:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch follow-up orders' });
    }
  }

  static async createFollowUpOrder(req, res) {
    try {
      const { patientId, visitId, followUpDate, reason, instructions } = req.body;

      const order = await prisma.followUpOrder.create({
        data: {
          patientId,
          visitId,
          orderedBy: req.user.id,
          followUpDate,
          reason,
          instructions,
          status: 'PENDING',
          createdDate: new Date().toISOString()
        }
      });

      return res.json({ success: true, data: order });
    } catch (error) {
      console.error('Error creating follow-up order:', error);
      return res.status(500).json({ success: false, error: 'Failed to create follow-up order' });
    }
  }

  static async updateFollowUpOrder(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const order = await prisma.followUpOrder.update({
        where: { id },
        data: {
          status,
          notes
        }
      });

      return res.json({ success: true, data: order });
    } catch (error) {
      console.error('Error updating follow-up order:', error);
      return res.status(500).json({ success: false, error: 'Failed to update follow-up order' });
    }
  }

  // Nursing Orders
  static async getNursingOrdersByPatient(req, res) {
    try {
      const { id } = req.params;
      const orders = await prisma.nursingOrder.findMany({
        where: { patientId: id },
        include: {
          visit: true
        },
        orderBy: { orderedDate: 'desc' }
      });

      return res.json({ success: true, data: orders });
    } catch (error) {
      console.error('Error fetching nursing orders:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch nursing orders' });
    }
  }

  static async createNursingOrder(req, res) {
    try {
      const { patientId, visitId, type, frequency, priority, instructions } = req.body;

      const order = await prisma.nursingOrder.create({
        data: {
          patientId,
          visitId,
          orderedBy: req.user.id,
          type,
          frequency,
          priority: priority || 'ROUTINE',
          status: 'ACTIVE',
          instructions,
          orderedDate: new Date().toISOString()
        }
      });

      return res.json({ success: true, data: order });
    } catch (error) {
      console.error('Error creating nursing order:', error);
      return res.status(500).json({ success: false, error: 'Failed to create nursing order' });
    }
  }

  static async updateNursingOrder(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const order = await prisma.nursingOrder.update({
        where: { id },
        data: {
          status,
          notes
        }
      });

      return res.json({ success: true, data: order });
    } catch (error) {
      console.error('Error updating nursing order:', error);
      return res.status(500).json({ success: false, error: 'Failed to update nursing order' });
    }
  }

  // Referral Orders
  static async getReferralOrdersByPatient(req, res) {
    try {
      const { id } = req.params;
      const orders = await prisma.referralOrder.findMany({
        where: { patientId: id },
        include: {
          visit: true
        },
        orderBy: { createdDate: 'desc' }
      });

      return res.json({ success: true, data: orders });
    } catch (error) {
      console.error('Error fetching referral orders:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch referral orders' });
    }
  }

  static async createReferralOrder(req, res) {
    try {
      const { patientId, visitId, referredTo, specialty, urgency, reason } = req.body;

      const order = await prisma.referralOrder.create({
        data: {
          patientId,
          visitId,
          orderedBy: req.user.id,
          referredTo,
          specialty,
          urgency: urgency || 'ROUTINE',
          reason,
          status: 'PENDING',
          createdDate: new Date().toISOString()
        }
      });

      return res.json({ success: true, data: order });
    } catch (error) {
      console.error('Error creating referral order:', error);
      return res.status(500).json({ success: false, error: 'Failed to create referral order' });
    }
  }

  static async updateReferralOrder(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const order = await prisma.referralOrder.update({
        where: { id },
        data: {
          status,
          notes
        }
      });

      return res.json({ success: true, data: order });
    } catch (error) {
      console.error('Error updating referral order:', error);
      return res.status(500).json({ success: false, error: 'Failed to update referral order' });
    }
  }
}

module.exports = OrderController;
