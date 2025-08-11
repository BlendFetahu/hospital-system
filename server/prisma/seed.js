// server/prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";
  const password = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password, role: "ADMIN" },
  });

  console.log("Seeded admin:", admin);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
