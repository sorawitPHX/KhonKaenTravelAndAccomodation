const fs = require('fs');
const csvParser = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const path = require('path')
const prisma = new PrismaClient();

async function seedTourism() {
  const results = [];

  fs.createReadStream(path.join(__dirname, '..', 'public', 'data', 'สถานที่ท่องเที่ยว.csv'))
    .pipe(csvParser())
    .on('data', (row) => {
      results.push(row);
    })
    .on('end', async () => {
      for (const row of results) {
        try {
            const checkExist = await prisma.$executeRaw`
                SELECT id FROM "TourismSpot" WHERE name = ${row.name}
                `
            if(checkExist) {
                console.log('มีในฐานจ้อมูลแล้ว', row.name)
            }else {
                await prisma.$executeRaw`
                    INSERT INTO "TourismSpot" (name, category, "openingHours", photos, "updatedAt", geom)
                    VALUES (
                    ${row.name}, 
                    ${row.category}::"TourismCategory", 
                    ${row.openingHours}, 
                    ${row.image_path}, 
                    now(),
                    ST_SetSRID(ST_MakePoint(${row.long}::double precision, ${row.lat}::double precision), 4326)
                    )
                `;
            }
        } catch (error) {
          console.error(`❌ เกิดข้อผิดพลาดในการ INSERT: ${error.message}`);
        }
      }
      console.log("✅ Import CSV สำเร็จ!");
      prisma.$disconnect();
    });
}

module.exports = {seedTourism}