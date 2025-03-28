const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ดึงข้อมูลสถานที่ทั้งหมด
router.get("/", async (req, res) => {
  const id = req.query.id
  if (id) {
    const results = await prisma.$queryRaw`
      SELECT 
        "id", 
        "name", 
        "category", 
        "openingHours", 
        "photos", 
        "address", 
        "createdAt", 
        "updatedAt", 
        ST_X(geom) as longitude, 
        ST_Y(geom) as latitude
      FROM "TourismSpot"
      WHERE id = ${id}::integer
    `
    res.json(results)
  } else {
    const results = await prisma.$queryRaw`
      SELECT 
        "id", 
        "name", 
        "category", 
        "openingHours", 
        "photos", 
        "address", 
        "createdAt", 
        "updatedAt", 
        ST_X(geom) as longitude, 
        ST_Y(geom) as latitude
      FROM "TourismSpot"
    `
    res.json(results)
  }
});

// 📍 เพิ่มสถานที่ท่องเที่ยวใหม่
router.post("/", async (req, res) => {
  try {
    const { name, category, openingHours, photos, address, long, lat } = req.body;
    console.log(req.body)
    await prisma.$executeRaw`
      INSERT INTO "TourismSpot" (name, category, "openingHours", photos, address, "updatedAt", geom)
      VALUES (
        ${name}, 
        ${category}::"TourismCategory", 
        ${openingHours}, 
        ${photos}, 
        ${address}, 
        now(),
        ST_SetSRID(ST_MakePoint(${long}::double precision, ${lat}::double precision), 4326)
      )
    `;
    res.json({ message: "Tourism spot added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📍 แก้ไขข้อมูลสถานที่ท่องเที่ยว
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, openingHours, photos, address, long, lat } = req.body;
    await prisma.$executeRaw`
      UPDATE "TourismSpot"
      SET name = ${name},
          category = ${category}::"TourismCategory",
          "openingHours" = ${openingHours},
          photos = ${photos},
          address = ${address},
          "updatedAt" = now(),
          geom = ST_SetSRID(ST_MakePoint(${long}::double precision, ${lat}::double precision), 4326)
      WHERE id = ${id}::integer
    `;
    res.json({ message: `Tourism spot ${id} updated successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🗑️ ลบสถานที่ท่องเที่ยว
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.$executeRaw`
      DELETE FROM "TourismSpot" WHERE id = ${id}::integer
    `;
    res.json({ message: `Tourism spot ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;