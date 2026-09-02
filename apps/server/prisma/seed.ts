import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const categories = [
  { name: 'PC Games', slug: 'pc-games', icon: '\u{1F4BB}', sortOrder: 1, description: 'Steam, Epic and GOG keys delivered instantly.' },
  { name: 'PlayStation', slug: 'playstation', icon: '\u{1F3AE}', sortOrder: 2, description: 'PS5 and PS4 titles, add-ons and season passes.' },
  { name: 'Xbox', slug: 'xbox', icon: '\u{1F3AF}', sortOrder: 3, description: 'Xbox Series X|S and Game Pass content.' },
  { name: 'Nintendo', slug: 'nintendo', icon: '\u{1F344}', sortOrder: 4, description: 'Switch cartridges and eShop codes.' },
  { name: 'Game Dev Courses', slug: 'game-dev-courses', icon: '\u{1F393}', sortOrder: 5, description: 'Masterclasses from shipping industry developers.' },
  { name: 'Accessories', slug: 'accessories', icon: '\u{1F5B1}', sortOrder: 6, description: 'Controllers, headsets and desk gear.' },
];

const products = [
  {
    name: 'Cyberpunk 2077: Phantom Liberty',
    slug: 'cyberpunk-2077-phantom-liberty',
    category: 'pc-games',
    description: 'A spy-thriller expansion for the sprawling streets of Night City.',
    price: 29.99,
    compareAtPrice: 59.99,
    stock: 120,
    rating: 4.5,
    reviewCount: 2341,
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=600&fit=crop',
  },
  {
    name: 'Elden Ring: Shadow of the Erdtree',
    slug: 'elden-ring-shadow-of-the-erdtree',
    category: 'pc-games',
    description: 'The Lands Between open up once more in the largest FromSoftware expansion yet.',
    price: 39.99,
    compareAtPrice: 49.99,
    stock: 85,
    rating: 5,
    reviewCount: 5892,
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=600&fit=crop',
  },
  {
    name: 'God of War Ragnarok',
    slug: 'god-of-war-ragnarok',
    category: 'playstation',
    description: 'Kratos and Atreus face the coming of Fimbulwinter across the nine realms.',
    price: 49.99,
    compareAtPrice: 69.99,
    stock: 64,
    rating: 4.8,
    reviewCount: 4123,
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=600&fit=crop',
  },
  {
    name: 'Starfield Premium Edition',
    slug: 'starfield-premium-edition',
    category: 'xbox',
    description: 'Chart a thousand planets with early access and the Shattered Space story pack.',
    price: 69.99,
    compareAtPrice: 99.99,
    stock: 40,
    rating: 4.3,
    reviewCount: 1876,
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=600&fit=crop',
  },
  {
    name: 'Baldurs Gate 3',
    slug: 'baldurs-gate-3',
    category: 'pc-games',
    description: 'A party-based RPG where every choice reshapes the Forgotten Realms.',
    price: 59.99,
    compareAtPrice: null,
    stock: 200,
    rating: 4.9,
    reviewCount: 8934,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1612287230217-969b698cb8d1?w=600&h=600&fit=crop',
  },
  {
    name: 'Spider-Man 2',
    slug: 'spider-man-2',
    category: 'playstation',
    description: 'Swing across a rebuilt New York as both Peter Parker and Miles Morales.',
    price: 69.99,
    compareAtPrice: null,
    stock: 95,
    rating: 4.8,
    reviewCount: 3421,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600&h=600&fit=crop',
  },
  {
    name: 'Alan Wake 2',
    slug: 'alan-wake-2',
    category: 'pc-games',
    description: 'A survival horror sequel that braids two detectives into one nightmare.',
    price: 49.99,
    compareAtPrice: null,
    stock: 70,
    rating: 4.6,
    reviewCount: 2156,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&h=600&fit=crop',
  },
  {
    name: 'Resident Evil 4 Remake',
    slug: 'resident-evil-4-remake',
    category: 'xbox',
    description: 'The rescue mission in the village, rebuilt from the ground up.',
    price: 39.99,
    compareAtPrice: null,
    stock: 110,
    rating: 4.7,
    reviewCount: 4567,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600&h=600&fit=crop',
  },
  {
    name: 'The Legend of Zelda: Tears of the Kingdom',
    slug: 'zelda-tears-of-the-kingdom',
    category: 'nintendo',
    description: 'Build, glide and fuse your way across a Hyrule split between sky and depths.',
    price: 59.99,
    compareAtPrice: 69.99,
    stock: 150,
    rating: 4.9,
    reviewCount: 7210,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=600&h=600&fit=crop',
  },
  {
    name: 'Unreal Engine 5 Masterclass',
    slug: 'unreal-engine-5-masterclass',
    category: 'game-dev-courses',
    description: '32 hours of production workflow, Nanite, Lumen and shipping a vertical slice.',
    price: 149.0,
    compareAtPrice: 299.0,
    stock: 999,
    rating: 4.7,
    reviewCount: 612,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=600&fit=crop',
  },
  {
    name: 'Unity Gameplay Programming Track',
    slug: 'unity-gameplay-programming-track',
    category: 'game-dev-courses',
    description: 'From C# fundamentals to netcode, taught by developers who ship.',
    price: 119.0,
    compareAtPrice: 199.0,
    stock: 999,
    rating: 4.5,
    reviewCount: 388,
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=600&fit=crop',
  },
  {
    name: 'Pro Wireless Controller',
    slug: 'pro-wireless-controller',
    category: 'accessories',
    description: 'Hall-effect sticks, remappable paddles and a 40-hour battery.',
    price: 79.9,
    compareAtPrice: 99.9,
    stock: 58,
    rating: 4.4,
    reviewCount: 934,
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&h=600&fit=crop',
  },
];

async function main() {
  const passwordHash = await bcrypt.hash('Student123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { firstName: 'Admin', lastName: 'Instructor', email: 'admin@example.com', passwordHash, role: Role.ADMIN },
  });
  await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {},
    create: { firstName: 'Student', lastName: 'One', email: 'student1@example.com', passwordHash },
  });
  await prisma.user.upsert({
    where: { email: 'student2@example.com' },
    update: {},
    create: { firstName: 'Student', lastName: 'Two', email: 'student2@example.com', passwordHash },
  });

  const categoryIdBySlug = new Map<string, string>();
  for (const category of categories) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { icon: category.icon, sortOrder: category.sortOrder, description: category.description },
      create: category,
    });
    categoryIdBySlug.set(category.slug, row.id);
  }

  for (const { category, ...product } of products) {
    const categoryId = categoryIdBySlug.get(category);
    if (!categoryId) throw new Error(`Seed error: unknown category "${category}"`);
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product, categoryId },
      create: { ...product, categoryId },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
