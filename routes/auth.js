const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { redirectIfAuthenticated, requireAuth } = require('../middlewares/authMiddleware')

// ตรวจสอบว่ามีโฟลเดอร์ `public/uploads` หรือไม่ ถ้าไม่มีให้สร้างขึ้นมา
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ตั้งค่า `multer` ให้บันทึกไฟล์ลงโฟลเดอร์ `public/uploads/`
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // กำหนดที่เก็บไฟล์
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// ฟิลเตอร์ประเภทไฟล์ที่อนุญาตให้รับ (เช่น รูปภาพ)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        return cb(new Error('ไฟล์ที่อัปโหลดต้องเป็นรูปภาพ (JPEG, PNG, GIF) เท่านั้น!'));
    }
};

// กำหนดขนาดไฟล์สูงสุด (เช่น 5MB)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // จำกัด 5MB
});


// **สมัครสมาชิก**
router.post("/signUp", upload.single('profile'), async (req, res) => {
    try {
        const data = req.body;
        const file = req.file;

        // ตรวจสอบว่า `data.email` และ `data.password` มีค่าหรือไม่
        if (!data.email || !data.password || !data.name) {
            return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }

        // **เช็คว่า email มีอยู่ในระบบหรือยัง**
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        // ถ้ามีให้ response error ออกไปว่าใช้ไปแล้ว
        if (existingUser) {
            return res.status(400).json({ error: "อีเมลนี้ถูกใช้ไปแล้ว" });
        }

        // Hash รหัสผ่านก่อนบันทึก
        const hashPassword = await bcrypt.hash(data.password, 10);

        // ตั้งค่า `profile_image` โดยตัด `public/` ออกให้เป็น `/uploads/...`
        let profile_image = file ? `/uploads/${file.filename}` : null;

        // บันทึกข้อมูลใน `Prisma`
        const user = await prisma.user.upsert({
            where: { email: data.email },
            update: {}, // ไม่อัปเดต user เดิม (ตามโค้ดที่ให้มา)
            create: {
                name: data.name,
                email: data.email,
                password: hashPassword,
                profile_image: profile_image
            }
        });

        console.log("Uploaded file:", file);

        // เก็บ userId ลง session
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userProfile = user.profile_image || 'images/profile3.png';
        req.session.userRole = user.role;
        res.json({ message: "สมัครสมาชิกสำเร็จ!", user });
        
    } catch (error) {
        console.error("Error in /signUp:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
    }
});

// เข้าสู่ระบบ
router.post("/signIn", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password)
        
        if (!email || !password) {
            return res.status(403).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }
        
        // ค้นหา user
        const user = await prisma.user.findUnique({ where: { email } });
        
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(403).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }
        
        // เก็บ userId ลง session
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userProfile = user.profile_image || 'images/profile3.png';
        req.session.userRole = user.role;
        
        // ไปหน้าแรก
        res.json({ message: "เข้าสู่ระบบสำเร็จ!", user });
        
    } catch (error) {
        console.error("Error in SignIn:", error);
        return res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
    }
});

router.get("/signOut", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
})

// ดึงข้อมูลโปรไฟล์
router.get("/profile", requireAuth, async (req, res) => {
    const userId = req.session.userId
    if(!userId) {
        res.status(400).json({error: 'คุณยังไม่ได้เข้าสู่ระบบ'})
    }
    const user = await prisma.user.findUnique({
        where: {id: userId}
    })
    if(!user) {
        res.status(400).json({error: 'ไม่พบข้อมูลผู้ใช้ดังกล่าว'})
    }
    res.json(user);
});


// แก้ไขโปรไฟล์
router.put("/profile", requireAuth, upload.single("profile"), async (req, res) => {
    try {
        const userId = req.session.userId; // ได้จาก session
        const { name, email, password } = req.body;
        const file = req.file;
        
        // ค้นหา user ที่ต้องการแก้ไขก่อน
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });
        }

        let updatedData = { name, email };

        // ถ้ามีรหัสผ่านใหม่ ให้ Hash ก่อนบันทึก
        if (password) {
            updatedData.password = await bcrypt.hash(password, 10);
        }

        // ถ้ามีอัปโหลดรูปใหม่
        if (file) {
            updatedData.profile_image = `/uploads/${file.filename}`;
        }

        // อัปเดตโปรไฟล์
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updatedData
        });

        console.log(updatedUser)
        req.session.userName = updatedUser.name;
        req.session.userProfile = updatedUser.profile_image || 'images/profile3.png'
        
        res.json({ user: updatedUser, message: "อัปเดตโปรไฟล์สำเร็จ!" });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์" });
    }
});

router.get("/current-user", (req, res) => {
    if (req.session.userId) {
        res.json({ id: req.session.userId, role: req.session.userRole });
    } else {
        res.json({ id: null });
    }
});


module.exports = router;
