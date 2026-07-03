import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with exact Albert Lea Staging Lanes layout...');

  // Create Site
  const site = await prisma.site.upsert({
    where: { id: 'site-albert-lea' },
    update: {},
    create: {
      id: 'site-albert-lea',
      name: 'Albert Lea Facility',
      timezone: 'America/Chicago',
    }
  });

  const lanesToCreate = [];

  // ================= EAST WAREHOUSE =================
  // Main Center: STG01 - STG30 (Vertical)
  for (let i = 1; i <= 30; i++) {
    const name = `STG${i.toString().padStart(2, '0')}`;
    lanesToCreate.push({
      id: `lane-${name}`, name, zoneCode: 'EAST', status: 'EMPTY', siteId: site.id,
      x: i, y: 10, width: 1, length: 10
    });
  }

  // Top Right: STG31B-33B (Horizontal)
  for (let i = 1; i <= 3; i++) {
    const name = `STG${30 + i}B`;
    lanesToCreate.push({
      id: `lane-${name}`, name, zoneCode: 'EAST', status: 'EMPTY', siteId: site.id,
      x: 35, y: i * 2, width: 6, length: 1
    });
  }

  // Top Right: STG31A-33A (Horizontal)
  for (let i = 1; i <= 3; i++) {
    const name = `STG${30 + i}A`;
    lanesToCreate.push({
      id: `lane-${name}`, name, zoneCode: 'EAST', status: 'EMPTY', siteId: site.id,
      x: 45, y: i * 2, width: 6, length: 1
    });
  }

  // ================= WEST WAREHOUSE =================
  // STW01 - STW17
  for (let i = 1; i <= 17; i++) {
    const name = `STW${i.toString().padStart(2, '0')}`;
    const isWall = [6, 11].includes(i);
    lanesToCreate.push({
      id: `lane-${name}`, name, zoneCode: 'WEST', status: isWall ? 'BLOCKED' : 'EMPTY', siteId: site.id,
      x: i, y: 30, width: 1, length: 10
    });
  }

  // STW18 - STW42
  for (let i = 18; i <= 42; i++) {
    const name = `STW${i.toString().padStart(2, '0')}`;
    const isWall = [20, 25, 31, 36].includes(i);
    lanesToCreate.push({
      id: `lane-${name}`, name, zoneCode: 'WEST', status: isWall ? 'BLOCKED' : 'EMPTY', siteId: site.id,
      x: i + 2, y: 30, width: 1, length: 10 // +2 for physical wall gap
    });
  }

  // UPSERT ALL
  for (const lane of lanesToCreate) {
    await prisma.stagingLane.upsert({
      where: { id: lane.id },
      update: {
        x: lane.x, y: lane.y, width: lane.width, length: lane.length, 
        zoneCode: lane.zoneCode, status: lane.status
      },
      create: lane
    });
  }

  console.log(`Successfully seeded ${lanesToCreate.length} precise staging lanes!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
