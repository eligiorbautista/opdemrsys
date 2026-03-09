const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
});

prisma.$connect()
  .then(() => console.log('Database connected'))
  .catch((error) => console.error('Database connection error:', error));

module.exports = prisma;
