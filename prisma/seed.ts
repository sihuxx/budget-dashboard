import { PrismaClient } from "@prisma/client";
import { DEFAULT_CATEGORIES } from "../lib/default-categories";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.category.count();
  if (existing > 0) {
    console.log("Categories already seeded, skipping.");
    return;
  }

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.create({
      data: { ...cat, isDefault: true },
    });
  }
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
