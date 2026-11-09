import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const notices = await prisma.notice.findMany();
  console.log("Current notices in DB:");
  console.log(JSON.stringify(notices, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
