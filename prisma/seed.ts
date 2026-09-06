import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hashSync } from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.upsert({
    where: { username: "operator1" },
    update: {},
    create: {
      name: "Andi Operator",
      username: "operator1",
      passwordHash: hashSync("operator123", 10),
      role: "OPERATOR",
    },
  });

  await prisma.user.upsert({
    where: { username: "leader1" },
    update: {},
    create: {
      name: "Budi Leader",
      username: "leader1",
      passwordHash: hashSync("leader123", 10),
      role: "LEADER",
    },
  });

  // PRD 2.2: default fleet of 20 units, scalable by the Leader later.
  for (let i = 1; i <= 20; i++) {
    const caseNumber = `IC-${String(i).padStart(2, "0")}`;
    await prisma.ingotCase.upsert({
      where: { caseNumber },
      update: {},
      create: { caseNumber },
    });
  }

  console.log("Seed complete: operator1/operator123, leader1/leader123, 20 ingot cases.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
