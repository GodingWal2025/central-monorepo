const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.stagingLane.createMany({
    data: [
      { name: 'Lane 1', x: 50, y: 50, width: 200, length: 100, zoneCode: 'ZONE-A' },
      { name: 'Lane 2', x: 300, y: 50, width: 200, length: 100, zoneCode: 'ZONE-A' },
      { name: 'Lane 3', x: 550, y: 50, width: 200, length: 100, zoneCode: 'ZONE-B' },
    ]
  });
  console.log('Seeded database with 3 Staging Lanes.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
