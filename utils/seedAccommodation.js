const fs = require('fs');
const csvParser = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const path = require('path')

const prisma = new PrismaClient();

async function seedAccomodation() {
  const results = [];

  fs.createReadStream(path.join(__dirname, '..', 'public', 'data', 'ที่พัก.csv'))
    .pipe(csvParser())
    .on('data', (row) => {
      results.push(row);
    })
    .on('end', async () => {
      for (const row of results) {
        try {
            const checkExist = await prisma.$executeRaw`
                SELECT id FROM "AccommodationSpot" WHERE name = ${row.name}
                `
            if(checkExist) {
                console.log('มีในฐานข้อมูลแล้ว', row.name)
            }else {
                await prisma.$executeRaw`
                    INSERT INTO "AccommodationSpot" (name, address, "phoneNumber", category, price, "openingHours", photos, "updatedAt", geom)
                    VALUES (
                    ${row.name},
                    ${row.address}, 
                    ${row.phoneNumber},
                    ${row.category}::"AccommodationCategory", 
                    ${row.price}::integer, 
                    '24 ชั่วโมง', 
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

module.exports = {seedAccomodation}