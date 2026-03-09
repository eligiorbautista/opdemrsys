const prisma = require('../config/database');

class HealthController {
  static async check(req, res) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        success: true,
        status: 'healthy',
        system: process.env.SYSTEM_NAME || 'OPDEMRSYS',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = HealthController;
