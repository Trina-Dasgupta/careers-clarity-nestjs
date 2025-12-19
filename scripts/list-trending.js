const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const projects = await prisma.trendingProject.findMany();
    console.log('Trending projects:', projects);
  } catch (err) {
    console.error('Error listing trending projects:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();