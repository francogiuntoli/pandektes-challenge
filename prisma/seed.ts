import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rawEmail = process.env.SEED_USER_EMAIL;
  const password = process.env.SEED_USER_PASSWORD;
  const saltRounds = Number(process.env.SEED_USER_SALT_ROUNDS ?? 12);

  if (!rawEmail || !password) {
    throw new Error(
      'SEED_USER_EMAIL and SEED_USER_PASSWORD must be provided when running the seed script.',
    );
  }

  const email = rawEmail.trim().toLowerCase();

  if (Number.isNaN(saltRounds) || saltRounds < 4) {
    throw new Error(
      'SEED_USER_SALT_ROUNDS must be a number greater than or equal to 4.',
    );
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`Seeded application user with email: ${email}`);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
