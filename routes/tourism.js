const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ดึงข้อมูลสถานที่ทั้งหมด
router.get("/", async (req, res) => {
  const results = await prisma.$queryRaw`
    SELECT 
      "id", 
      "name", 
      "category", 
      "openingHours", 
      "photos", 
      "createdAt", 
      "updatedAt", 
      ST_X(geom) as longitude, 
      ST_Y(geom) as latitude
    FROM "TourismSpot"
  `
  res.json(results)
});

// เพิ่มสถานที่ใหม่
router.post("/", (req, res) => {
  res.json({ message: "Point added successfully" });
});

// แก้ไขข้อมูลสถานที่
router.put("/:id", (req, res) => {
  res.json({ message: `Point ${req.params.id} updated successfully` });
});

// ลบสถานที่
router.delete("/:id", (req, res) => {
  res.json({ message: `Point ${req.params.id} deleted successfully` });
});

module.exports = router;