import { prisma } from './src/config/prisma';
import * as argon2 from 'argon2';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // 1. Create Roles & Permissions
    const adminRole = await prisma.role.upsert({ where: { roleName: 'admin' }, update: {}, create: { roleName: 'admin' } });
    const orgRole = await prisma.role.upsert({ where: { roleName: 'organizer' }, update: {}, create: { roleName: 'organizer' } });
    const vendorRole = await prisma.role.upsert({ where: { roleName: 'vendor' }, update: {}, create: { roleName: 'vendor' } });

    const createEventPerm = await prisma.permission.upsert({ where: { permissionName: 'create_event' }, update: {}, create: { permissionName: 'create_event' } });
    const bookBoothPerm = await prisma.permission.upsert({ where: { permissionName: 'book_booth' }, update: {}, create: { permissionName: 'book_booth' } });
    const viewAdminDashPerm = await prisma.permission.upsert({ where: { permissionName: 'view_admin_dashboard' }, update: {}, create: { permissionName: 'view_admin_dashboard' } });

    await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: adminRole.roleId, permissionId: viewAdminDashPerm.permissionId } }, update: {}, create: { roleId: adminRole.roleId, permissionId: viewAdminDashPerm.permissionId } });
    await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: adminRole.roleId, permissionId: createEventPerm.permissionId } }, update: {}, create: { roleId: adminRole.roleId, permissionId: createEventPerm.permissionId } });
    await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: orgRole.roleId, permissionId: createEventPerm.permissionId } }, update: {}, create: { roleId: orgRole.roleId, permissionId: createEventPerm.permissionId } });
    await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: vendorRole.roleId, permissionId: bookBoothPerm.permissionId } }, update: {}, create: { roleId: vendorRole.roleId, permissionId: bookBoothPerm.permissionId } });

    // 2. Create Users
    const passwordHash = await argon2.hash('password123');

    const admin = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: { passwordHash },
      create: { email: 'admin@test.com', username: 'SuperAdmin', passwordHash }
    });
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: admin.userId, roleId: adminRole.roleId } }, update: {}, create: { userId: admin.userId, roleId: adminRole.roleId } });

    const org = await prisma.user.upsert({
      where: { email: 'org@test.com' },
      update: { passwordHash },
      create: { email: 'org@test.com', username: 'BestOrganizer', passwordHash }
    });
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: org.userId, roleId: orgRole.roleId } }, update: {}, create: { userId: org.userId, roleId: orgRole.roleId } });

    const vendor = await prisma.user.upsert({
      where: { email: 'vendor@test.com' },
      update: { passwordHash },
      create: { email: 'vendor@test.com', username: 'HappyVendor', passwordHash }
    });
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: vendor.userId, roleId: vendorRole.roleId } }, update: {}, create: { userId: vendor.userId, roleId: vendorRole.roleId } });

    // 3. Create Dummy Event & Booths
    const event = await prisma.event.create({
      data: {
        organizerId: org.userId,
        eventName: 'Bangkok Tech Expo 2026',
        location: 'BITEC Bangna',
        startDate: new Date('2026-11-01T09:00:00Z'),
        endDate: new Date('2026-11-05T18:00:00Z'),
        eventStatus: 'open',
        booths: {
          create: [
            { boothNo: 'A-01', price: 5000, status: 'available' },
            { boothNo: 'A-02', price: 5000, status: 'available' },
            { boothNo: 'VIP-1', price: 15000, status: 'booked' },
          ]
        }
      }
    });

    console.log('✅ Seeding completed successfully!');
    console.log('-------------------------------------------');
    console.log('🔑 Test Accounts (Password for all is: password123)');
    console.log('Admin:     admin@test.com');
    console.log('Organizer: org@test.com');
    console.log('Vendor:    vendor@test.com');
    console.log('-------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
