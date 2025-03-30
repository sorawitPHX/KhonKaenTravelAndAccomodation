const { PrismaClient } = require('@prisma/client')
const { seedAccomodation } = require('../utils/seedAccommodation')
const { seedTourism } = require('../utils/seedTravel')
const bcrypt = require('bcrypt')

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

  // สร้าง User ที่มี role = admin
  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },  // หากมี admin แล้วจะไม่สร้างใหม่
    update: {},
    create: {
      email: 'admin@admin.com',  // อีเมลของ admin
      password: await bcrypt.hash('passw0rd', 10),  // รหัสผ่าน (อย่าลืมเข้ารหัสหากใช้งานจริง)
      role: 'admin',  // ระบุว่าเป็น admin
      name: 'นายเผือก สีสุภาพ'  // ชื่อของ admin
    }
  });

  console.log('✅ Admin user created or exists.');

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
