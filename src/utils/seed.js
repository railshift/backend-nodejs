import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

async function seedDatabase() {
  try {
    logger.info(' Starting database seed...');

    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    // SUPERADMIN - gets all alerts
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@railway.com' },
      update: {},
      create: {
        employeeId: 'SA001',
        name: 'Rajesh Kumar',
        email: 'admin@railway.com',
        phone: '+91-9876543210',
        password: hashedPassword,
        role: 'SUPERADMIN',
        status: 'ACTIVE',
        isVerified: true,
        verifiedAt: new Date(),
        division: 'CENTRAL',
        designation: 'X',
        priority: 2,
      },
    });

    logger.info(` SUPERADMIN created: ${superAdmin.name}`);
    logger.info(`   Email: admin@railway.com | Password: Admin@123`);

    // ADMIN - Designation X (all alerts)
    const adminX = await prisma.user.upsert({
      where: { email: 'admin.x@railway.com' },
      update: {},
      create: {
        employeeId: 'ADM001',
        name: 'Priya Singh',
        email: 'admin.x@railway.com',
        phone: '+91-9876543211',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        isVerified: true,
        verifiedAt: new Date(),
        division: 'CENTRAL',
        designation: 'X',
        priority: 1,
      },
    });

    logger.info(` ADMIN (Designation X - All Alerts) created: ${adminX.name}`);
    logger.info(`   Email: admin.x@railway.com | Password: Admin@123`);

    // ADMIN - Designation Y (10HR+ alerts)
    const adminY = await prisma.user.upsert({
      where: { email: 'admin.y@railway.com' },
      update: {},
      create: {
        employeeId: 'ADM002',
        name: 'Amit Patel',
        email: 'admin.y@railway.com',
        phone: '+91-9876543212',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        isVerified: true,
        verifiedAt: new Date(),
        division: 'CENTRAL',
        designation: 'Y',
        priority: 1,
      },
    });

    logger.info(` ADMIN (Designation Y - 10HR+ Alerts) created: ${adminY.name}`);
    logger.info(`   Email: admin.y@railway.com | Password: Admin@123`);

    // ADMIN - Designation Z (12HR+ alerts)
    const adminZ = await prisma.user.upsert({
      where: { email: 'admin.z@railway.com' },
      update: {},
      create: {
        employeeId: 'ADM003',
        name: 'Deepak Verma',
        email: 'admin.z@railway.com',
        phone: '+91-9876543213',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        isVerified: true,
        verifiedAt: new Date(),
        division: 'CENTRAL',
        designation: 'Z',
        priority: 0,
      },
    });

    logger.info(` ADMIN (Designation Z - 12HR+ Alerts) created: ${adminZ.name}`);
    logger.info(`   Email: admin.z@railway.com | Password: Admin@123`);

    // ADMIN - Different division, Designation X
    const adminNorthX = await prisma.user.upsert({
      where: { email: 'admin.north@railway.com' },
      update: {},
      create: {
        employeeId: 'ADM004',
        name: 'Neha Sharma',
        email: 'admin.north@railway.com',
        phone: '+91-9876543214',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        isVerified: true,
        verifiedAt: new Date(),
        division: 'NORTHERN',
        designation: 'X',
        priority: 1,
      },
    });

    logger.info(`ADMIN (Northern Division, X) created: ${adminNorthX.name}`);
    logger.info(`   Email: admin.north@railway.com | Password: Admin@123`);

    // ADMIN - Different division, Designation Y
    const adminNorthY = await prisma.user.upsert({
      where: { email: 'admin.north.y@railway.com' },
      update: {},
      create: {
        employeeId: 'ADM005',
        name: 'Vikram Singh',
        email: 'admin.north.y@railway.com',
        phone: '+91-9876543215',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        isVerified: true,
        verifiedAt: new Date(),
        division: 'NORTHERN',
        designation: 'Y',
        priority: 0,
      },
    });

    logger.info(` ADMIN (Northern Division, Y) created: ${adminNorthY.name}`);
    logger.info(`   Email: admin.north.y@railway.com | Password: Admin@123`);

    logger.info(' Database seeded successfully with designation-based alert hierarchy!');
    logger.info('\n📋 Alert Hierarchy:');
    logger.info('   • SUPERADMIN: Gets ALL alerts (7HR+)');
    logger.info('   • ADMIN with X: Gets ALL alerts (7HR+)');
    logger.info('   • ADMIN with Y: Gets 10HR+ alerts');
    logger.info('   • ADMIN with Z: Gets 12HR+ alerts');
  } catch (error) {
    logger.error(' Error seeding database:', error);
    throw error;
  }
}

export default seedDatabase;
