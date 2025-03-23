const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.tweet.deleteMany();
  console.log('All tweets deleted!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
