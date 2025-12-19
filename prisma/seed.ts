import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@yopmail.com';
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log('Admin user already exists:', email);
  } else {
    const password = 'Admin#123..';
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: 'Admin',
        role: UserRole.ADMIN,
        isActive: true,
        isEmailVerified: true,
        firstName: 'Admin',
        lastName: 'User',
      },
    });

    console.log('Created admin user:', user.email);
  }

  // Create sample trending projects if none exist
  const existingTrending = await prisma.trendingProject.findMany();
  if (!existingTrending || existingTrending.length === 0) {
    console.log('Seeding sample trending projects...');
    await prisma.trendingProject.createMany({
      data: [
        {
          title: 'Social Network Platform',
          description: 'Full-featured social media platform with real-time chat, posts, friends system, and notifications',
          price: 299,
          rating: 4.8,
          sales: 1247,
          author: 'CodeMasterPro',
          category: 'Social Media',
          tags: ['Next.js','Node.js','Socket.io','MongoDB','Tailwind'],
          previewUrl: '/preview/social-network',
          liveDemo: 'https://demo-social-network.vercel.app',
          lastUpdated: new Date('2024-01-15'),
          downloads: '2.5k',
          isTrending: true,
          isFeatured: false,
          features: JSON.stringify([
            'Real-time chat with Socket.io',
            'Post sharing & commenting',
            'Friend system & notifications'
          ]),
          techStack: JSON.stringify({ frontend: ['Next.js 14'], backend: ['Node.js'], database: ['MongoDB'] }),
          includes: ['Full source code','Documentation'],
          reviews: 89,
          version: '2.1.0',
          link: 'https://github.com/owner/repo',
          imageUrl: 'https://cdn.example.com/image.png',
          isActive: true
        }
      ],
    });
    console.log('Seeded trending projects');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
