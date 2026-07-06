import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Roles
  const roles = await Promise.all([
    prisma.role.upsert({ where: { roleName: 'admin' }, update: {}, create: { roleName: 'admin', description: 'ผู้ดูแลระบบ' } }),
    prisma.role.upsert({ where: { roleName: 'organizer' }, update: {}, create: { roleName: 'organizer', description: 'ผู้จัดงาน' } }),
    prisma.role.upsert({ where: { roleName: 'vendor' }, update: {}, create: { roleName: 'vendor', description: 'ผู้ค้า' } }),
    prisma.role.upsert({ where: { roleName: 'visitor' }, update: {}, create: { roleName: 'visitor', description: 'ผู้เข้าชมงาน' } }),
  ]);
  console.log('✅ Roles seeded:', roles.map(r => r.roleName));

  // Permissions
  const permissionData = [
    { permissionName: 'manage_users',     description: 'จัดการบัญชีผู้ใช้งานทั้งหมด' },
    { permissionName: 'approve_organizer',description: 'อนุมัติคำขอสิทธิ์ผู้จัดงาน' },
    { permissionName: 'create_event',     description: 'สร้างงานกิจกรรม' },
    { permissionName: 'edit_event',       description: 'แก้ไขงานกิจกรรม' },
    { permissionName: 'delete_event',     description: 'ลบงานกิจกรรม' },
    { permissionName: 'manage_booth',     description: 'จัดการบูธและผังพื้นที่' },
    { permissionName: 'approve_booking',  description: 'อนุมัติ/ปฏิเสธการจองบูธ' },
    { permissionName: 'book_booth',       description: 'จองบูธ' },
    { permissionName: 'view_event',       description: 'ดูข้อมูลงานกิจกรรม' },
    { permissionName: 'manage_penalty',   description: 'จัดการบทลงโทษ' },
    { permissionName: 'verify_payment',   description: 'ตรวจสอบและยืนยันการชำระเงิน' },
    { permissionName: 'view_admin_dashboard', description: 'ดูแดชบอร์ดผู้ดูแลระบบ' },
  ];

  const permissions = await Promise.all(
    permissionData.map(p =>
      prisma.permission.upsert({
        where: { permissionName: p.permissionName },
        update: {},
        create: p,
      })
    )
  );
  console.log('✅ Permissions seeded:', permissions.length);

  // Role-Permission mapping
  const roleMap = Object.fromEntries(roles.map(r => [r.roleName, r.roleId]));
  const permMap = Object.fromEntries(permissions.map(p => [p.permissionName, p.permissionId]));

  const mappings: { roleName: string; permissions: string[] }[] = [
    {
      roleName: 'admin',
      permissions: permissionData.map(p => p.permissionName), // admin ได้ทุก permission
    },
    {
      roleName: 'organizer',
      permissions: ['create_event', 'edit_event', 'delete_event', 'manage_booth', 'approve_booking', 'view_event', 'manage_penalty', 'verify_payment'],
    },
    {
      roleName: 'vendor',
      permissions: ['book_booth', 'view_event'],
    },
    {
      roleName: 'visitor',
      permissions: ['view_event'],
    },
  ];

  for (const mapping of mappings) {
    for (const permName of mapping.permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: roleMap[mapping.roleName]!,
            permissionId: permMap[permName]!,
          },
        },
        update: {},
        create: {
          roleId: roleMap[mapping.roleName]!,
          permissionId: permMap[permName]!,
        },
      });
    }
  }
  console.log('✅ Role-Permission mappings seeded');
  console.log('🎉 Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());