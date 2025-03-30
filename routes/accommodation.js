const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ดึงข้อมูลสถานที่ทั้งหมด
router.get("/", async (req, res) => {
  try {
    const id = req.query.id
    if (id) {
      const results = await prisma.$queryRaw`
    SELECT 
      "id", 
      "name", 
      "address", 
      "phoneNumber", 
      "website", 
      "category", 
      "price", 
      "openingHours", 
      COALESCE(NULLIF("photos", ''), '/images/Image_not_available.png') AS "photos", 
      "createdAt", 
      "updatedAt", 
      ST_X(geom) as longitude, 
      ST_Y(geom) as latitude
    FROM "AccommodationSpot"
    WHERE id = ${id}::integer
  `
      res.json(results)
    } else {
      const results = await prisma.$queryRaw`
    SELECT 
      "id", 
      "name", 
      "address", 
      "phoneNumber", 
      "website", 
      "category", 
      "price", 
      "openingHours", 
      COALESCE(NULLIF("photos", ''), '/images/Image_not_available.png') AS "photos", 
      "createdAt", 
      "updatedAt", 
      ST_X(geom) as longitude, 
      ST_Y(geom) as latitude
    FROM "AccommodationSpot"
  `
      res.json(results)
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📍 เพิ่มที่พักใหม่
router.post("/", async (req, res) => {
  try {
    const { name, address, phoneNumber, category, price, openingHours, photos, website, long, lat } = req.body;
    await prisma.$executeRaw`
      INSERT INTO "AccommodationSpot" (name, address, "phoneNumber", category, price, "openingHours", photos, website, "updatedAt", geom)
      VALUES (
        ${name}, 
        ${address}, 
        ${phoneNumber}, 
        ${category}::"AccommodationCategory", 
        ${price}::integer, 
        ${openingHours}, 
        ${photos}, 
        ${website}, 
        now(),
        ST_SetSRID(ST_MakePoint(${long}::double precision, ${lat}::double precision), 4326)
      )
    `;
    res.json({ message: "Accommodation added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📍 แก้ไขข้อมูลที่พัก
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phoneNumber, category, price, openingHours, photos, website, long, lat } = req.body;
    await prisma.$executeRaw`
      UPDATE "AccommodationSpot"
      SET name = ${name},
          address = ${address},
          "phoneNumber" = ${phoneNumber},
          category = ${category}::"AccommodationCategory",
          price = ${price}::integer,
          "openingHours" = ${openingHours},
          photos = ${photos},
          website = ${website},
          "updatedAt" = now(),
          geom = ST_SetSRID(ST_MakePoint(${long}::double precision, ${lat}::double precision), 4326)
      WHERE id = ${id}::integer
    `;
    res.json({ message: `Accommodation ${id} updated successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🗑️ ลบที่พัก
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.$executeRaw`
      DELETE FROM "AccommodationSpot" WHERE id = ${id}::integer
    `;
    res.json({ message: `Accommodation ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;