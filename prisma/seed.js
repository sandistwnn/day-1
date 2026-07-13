const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const prisma = new PrismaClient();

async function main() {
  console.log('Mulai seeding...');

  await prisma.task.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Belajar', color: '#6366F1' } }),
    prisma.category.create({ data: { name: 'Pekerjaan', color: '#F59E0B' } }),
    prisma.category.create({ data: { name: 'Proyek', color: '#10B981' } }),
  ]);
  console.log(` ✓ ${categories.length} kategori dibuat`);

  const hash = (pw) => argon2.hash(pw, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Admin WAD',
        email: 'admin@example.com',
        password: await hash('passwordAdmin'),
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: await hash('password123'),
        role: 'USER',
      },
    }),
  ]);
  console.log(` ✓ ${users.length} user dibuat`);

  const tasks = await Promise.all([
    prisma.task.create({ data: {
      title: 'Setup Express server',
      status: 'DONE',
      priority: 'HIGH',
      userId: users[0].id,
      categoryId: categories[2].id,
    } }),
    prisma.task.create({ data: {
      title: 'Belajar REST API',
      status: 'DONE',
      priority: 'HIGH',
      userId: users[0].id,
      categoryId: categories[0].id,
    } }),
    prisma.task.create({ data: {
      title: 'Setup PostgreSQL',
      description: 'Menggunakan Docker',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      userId: users[0].id,
      categoryId: categories[2].id,
    } }),
    prisma.task.create({ data: {
      title: 'Belajar Prisma ORM',
      status: 'TODO',
      priority: 'MEDIUM',
      userId: users[0].id,
      categoryId: categories[0].id,
    } }),
    prisma.task.create({ data: {
      title: 'Review laporan bulanan',
      status: 'TODO',
      priority: 'LOW',
      userId: users[1].id,
      categoryId: categories[1].id,
    } }),
    prisma.task.create({ data: {
      title: 'Meeting dengan tim desain',
      status: 'TODO',
      priority: 'MEDIUM',
      userId: users[1].id,
      categoryId: categories[1].id,
    } }),
  ]);
  console.log(` ✓ ${tasks.length} task dibuat`);
  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });