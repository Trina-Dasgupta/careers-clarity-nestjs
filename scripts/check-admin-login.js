const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('DATABASE_URL=', process.env.DATABASE_URL ? '[REDACTED]' : 'not-set');
    const email = 'admin@yopmail.com';
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      const all = await prisma.user.findMany({ select: { id: true, email: true, isActive: true } });
      console.log('All users:', all);
      return;
    }
    const password = 'Admin#123..';
    const ok = await bcrypt.compare(password, user.password);
    console.log('User found:', user.email, 'isActive=', user.isActive, 'passwordMatch=', ok);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
