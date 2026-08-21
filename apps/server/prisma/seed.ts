import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Student123!', 10);
  const admin = await prisma.user.upsert({ where: { email: 'admin@example.com' }, update: {}, create: { firstName: 'Admin', lastName: 'Instructor', email: 'admin@example.com', passwordHash, role: Role.ADMIN } });
  await prisma.user.upsert({ where: { email: 'student1@example.com' }, update: {}, create: { firstName: 'Student', lastName: 'One', email: 'student1@example.com', passwordHash } });
  await prisma.user.upsert({ where: { email: 'student2@example.com' }, update: {}, create: { firstName: 'Student', lastName: 'Two', email: 'student2@example.com', passwordHash } });
  const electronics = await prisma.category.upsert({ where: { slug: 'electronics' }, update: {}, create: { name: 'Electronics', slug: 'electronics' } });
  const home = await prisma.category.upsert({ where: { slug: 'home' }, update: {}, create: { name: 'Home', slug: 'home' } });
  await prisma.product.createMany({ data: [
    { name: 'Wireless Headphones', slug: 'wireless-headphones', description: 'Everyday studio sound.', price: 89.99, stock: 25, categoryId: electronics.id },
    { name: 'Desk Lamp', slug: 'desk-lamp', description: 'Warm light for focused work.', price: 34.5, stock: 40, categoryId: home.id },
  ], skipDuplicates: true });
  console.log(`Seeded admin ${admin.email} and starter catalog.`);
}

main().finally(() => prisma.$disconnect());
