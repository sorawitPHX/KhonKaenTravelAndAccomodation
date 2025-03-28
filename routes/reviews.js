const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { requireAuthApi } = require('../middlewares/authMiddleware')

const prisma = new PrismaClient();

// 📌 ดึงรีวิวทั้งหมด
router.get("/:type/:id", async (req, res) => {
    try {
        const { type, id } = req.params;
        let reviews;
        if (type === "tourism") {
            reviews = await prisma.review.findMany({
                where: { tourismSpotId: parseInt(id) },
                include: { user: true, reviewLikes: true }
            });
        } else if (type === "accommodation") {
            reviews = await prisma.review.findMany({
                where: { accommodationSpotId: parseInt(id) },
                include: { user: true, reviewLikes: true }
            });
        } else {
            return res.status(400).json({ error: "Invalid type" });
        }

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว" });
    }
});


// 📌 เพิ่มรีวิวใหม่
router.post('/', requireAuthApi, async (req, res) => {
    let { type, placeId, rating, comment } = req.body;
    const userId = req.session.userId;
    placeId = parseInt(placeId)
    rating = parseInt(rating)
    if (!userId) {
        return res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" });
    }

    let newReview;
    if (type === "tourism") {
        newReview = await prisma.review.create({
            data: { userId, tourismSpotId: parseInt(placeId), rating, comment }
        });
    } else if (type === "accommodation") {
        newReview = await prisma.review.create({
            data: { userId, accommodationSpotId: parseInt(placeId), rating, comment }
        });
    } else {
        return res.status(400).json({ error: "ประเภทสถานที่ไม่ถูกต้อง" });
    }

    res.json(newReview);
});

// 📌 ลบรีวิว
router.delete("/:id", requireAuthApi, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.review.delete({ where: { id: parseInt(id) } });
        res.json({ message: "ลบรีวิวเรียบร้อยแล้ว" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "ไม่สามารถลบรีวิวได้" });
    }
});

// 📌 กดไลก์ / ยกเลิกไลก์ รีวิว
router.post("/:reviewId/like", requireAuthApi, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.session.userId;

        if (!userId) return res.status(400).json({ error: "ต้องระบุ userId" });

        const existingLike = await prisma.reviewLike.findFirst({
            where: { reviewId: parseInt(reviewId), userId }
        });

        if (existingLike) {
            // ถ้ามีไลก์อยู่แล้ว -> ลบออก (Unlike)
            await prisma.reviewLike.delete({
                where: { id: existingLike.id }
            });
            return res.status(200).json({ message: "ยกเลิกไลก์สำเร็จ" });
        } else {
            // ถ้ายังกดไลก์ -> เพิ่มไลก์
            const like = await prisma.reviewLike.create({
                data: { reviewId: parseInt(reviewId), userId }
            });
            return res.status(201).json(like);
        }
    } catch (error) {
        res.status(400).json({ error: "ไม่สามารถกดไลก์/ยกเลิกไลก์ได้" });
    }
});

module.exports = router;
