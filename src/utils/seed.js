import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

async function seedDatabase() {
  try {
    logger.info('🌱 Starting database seed...');

    // Check if super admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@railway.com' },
    });

    if (existingAdmin) {
      logger.info('✅ Super admin already exists');
      return;
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    const superAdmin = await prisma.user.create({
      data: {
        employeeId: 'ADMIN001',
        name: 'Super Admin',
        email: 'admin@railway.com',
        password: hashedPassword,
        role: 'SUPERADMIN',
        status: 'ACTIVE',
      },
    });

    logger.info('✅ Super admin created');
    logger.info(`   Email: admin@railway.com`);
    logger.info(`   Password: Admin@123`);

    // Create regular admin
    const admin = await prisma.user.create({
      data: {
        employeeId: 'ADMIN002',
        name: 'Admin User',
        email: 'admin2@railway.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    logger.info('✅ Regular admin created');
    logger.info(`   Email: admin2@railway.com`);
    logger.info(`   Password: Admin@123`);

    // Create regular user
    const user = await prisma.user.create({
      data: {
        employeeId: 'USER001',
        name: 'Regular User',
        email: 'user@railway.com',
        password: hashedPassword,
        role: 'USER',
        status: 'ACTIVE',
      },
    });

    logger.info('✅ Regular user created');
    logger.info(`   Email: user@railway.com`);
    logger.info(`   Password: Admin@123`);

    logger.info('🎉 Database seeded successfully!');
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  }
}

export default seedDatabase;
