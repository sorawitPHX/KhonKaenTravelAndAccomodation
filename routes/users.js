const express = require("express");
const router = express.Router();

// สมัครสมาชิก
router.post("/signUp", (req, res) => {
  res.json({ message: "User signed up" });
});

// เข้าสู่ระบบ
router.post("/signIn", (req, res) => {
  res.json({ message: "User signed in" });
});

// ดึงข้อมูลโปรไฟล์
router.get("/profile", (req, res) => {
  res.json({ email: "user@example.com", name: "John Doe" });
});

// แก้ไขโปรไฟล์
router.put("/profile", (req, res) => {
  res.json({ message: "Profile updated successfully" });
});

module.exports = router;
