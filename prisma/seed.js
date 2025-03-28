const {PrismaClient} = require('@prisma/client')
const {seedAccomodation} = require('../utils/seedAccommodation')
const {seedTourism} = require('../utils/seedTravel')

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Running seed script...');

    // เปิดใช้งาน PostGIS ถ้ายังไม่มี
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS postgis;`);

    // เพิ่ม column geom ลงในตาราง TourismSpot ถ้ายังไม่มี
    await prisma.$executeRawUnsafe(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='TourismSpot' AND column_name='geom') THEN
        ALTER TABLE "TourismSpot" ADD COLUMN "geom" geometry(Point, 4326);
      END IF;
    END $$;
  `);

    // เพิ่ม column geom ลงในตาราง AccommodationSpot ถ้ายังไม่มี
    await prisma.$executeRawUnsafe(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='AccommodationSpot' AND column_name='geom') THEN
        ALTER TABLE "AccommodationSpot" ADD COLUMN "geom" geometry(Point, 4326);
      END IF;
    END $$;
  `);

    console.log('✅ Seed script completed.');
}

main()
    .then(async () => {
        await seedAccomodation()
        await seedTourism()
    })
    .catch((e) => {
        console.error('❌ Error running seed script:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
