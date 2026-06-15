import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

async function seedDatabase() {
  try {
    logger.info(' Starting database seed...');

    const hashedPassword = await bcrypt.hash('Admin@1234', 12);

    // SUPERADMIN - gets all alerts
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@railway.com' },
      update: {},
      create: {
        employeeId: 'SA001',
        name: 'Vinod Kumar',
        email: 'superadmin@railway.com',
        phone: '+91-9876543210',
        password: hashedPassword,
        role: 'SUPERADMIN',
        status: 'ACTIVE',
        isVerified: true,
        verifiedAt: new Date(),
        division: 'RANCHI',
        designation: 'OFFICER',
        priority: 2,
      },
    });

    logger.info(` SUPERADMIN created: ${superAdmin.name}`);
    logger.info(`   Email: superadmin@railway.com | Password: Admin@1234`);

    // ADMIN - Designation X (all alerts)
    const adminX = await prisma.user.upsert({
      where: { email: 'admin@railway.com' },
      update: {},
      create: {
        employeeId: 'ADM001',
        name: 'Test Admin',
        email: 'admin@railway.com',
        phone: '+91-9876543211',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        isVerified: true,
        verifiedAt: new Date(),
        division: 'RANCHI',
        designation: 'OFFICER',
        priority: 1,
      },
    });

    logger.info(` ADMIN (Designation X - All Alerts) created: ${adminX.name}`);
    logger.info(`   Email: admin@railway.com | Password: Admin@123`);



    logger.info(' Database seeded successfully with designation-based alert hierarchy!');
    logger.info('\n Alert Hierarchy:');
    logger.info('   • SUPERADMIN: Gets ALL alerts (7HR+)');
    logger.info('   • ADMIN with OFFICER: Gets ALL alerts (7HR+)');
    logger.info('   • ADMIN with SUPERVISOR: Gets 10HR+ alerts');
    logger.info('   • ADMIN with CHASER: Gets 12HR+ alerts');
  } catch (error) {
    logger.error(' Error seeding database:', error);
    throw error;
  }
}

export default seedDatabase;
