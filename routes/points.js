const express = require("express");
const router = express.Router();

// ดึงข้อมูลสถานที่ทั้งหมด
router.get("/", (req, res) => {
  res.json([
    { id: 1, name: "สถานที่ A", type: "สถานที่ท่องเที่ยว" },
    { id: 2, name: "สถานที่ B", type: "ที่พัก" },
  ]);
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