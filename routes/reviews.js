const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// 📌 ดึงรีวิวทั้งหมด
router.get("/", async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            include: {
                user: true,
                tourismSpot: true,
                accommodationSpot: true,
                reviewLikes: true,
            },
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว" });
    }
});

// 📌 ดึงรีวิวของสถานที่ท่องเที่ยว
router.get("/tourism/:tourismSpotId", async (req, res) => {
    try {
        const { tourismSpotId } = req.params;
        const reviews = await prisma.review.findMany({
            where: { tourismSpotId: parseInt(tourismSpotId) },
            include: { user: true, reviewLikes: true },
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: "ไม่สามารถดึงรีวิวของสถานที่ท่องเที่ยวนี้ได้" });
    }
});

// 📌 ดึงรีวิวของที่พัก
router.get("/accommodation/:accommodationSpotId", async (req, res) => {
    try {
        const { accommodationSpotId } = req.params;
        const reviews = await prisma.review.findMany({
            where: { accommodationSpotId: parseInt(accommodationSpotId) },
            include: { user: true, reviewLikes: true },
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: "ไม่สามารถดึงรีวิวของที่พักนี้ได้" });
    }
});

// 📌 เพิ่มรีวิวใหม่
router.post("/", async (req, res) => {
    try {
        const { userId, tourismSpotId, accommodationSpotId, comment, rating } = req.body;

        if (!userId || !rating || (!tourismSpotId && !accommodationSpotId)) {
            return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน" });
        }

        const review = await prisma.review.create({
            data: { userId, tourismSpotId, accommodationSpotId, comment, rating },
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ error: "ไม่สามารถเพิ่มรีวิวได้" });
    }
});

// 📌 ลบรีวิว
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.review.delete({ where: { id: parseInt(id) } });
        res.json({ message: "ลบรีวิวเรียบร้อยแล้ว" });
    } catch (error) {
        res.status(500).json({ error: "ไม่สามารถลบรีวิวได้" });
    }
});

// 📌 กดไลก์รีวิว
router.post("/:reviewId/like", async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { userId } = req.body;

        if (!userId) return res.status(400).json({ error: "ต้องระบุ userId" });

        const like = await prisma.reviewLike.create({
            data: { reviewId: parseInt(reviewId), userId },
        });

        res.status(201).json(like);
    } catch (error) {
        res.status(400).json({ error: "ไม่สามารถกดไลก์รีวิวได้" });
    }
});

module.exports = router;
