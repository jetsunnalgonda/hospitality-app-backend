// routes/scheduleRoutes.js
import express from 'express';
import prisma from '../utils/prisma.js';
import { authenticateJWT } from '../utils/authUtils.js';

const router = express.Router();

// Get all schedules for a user (requires authentication)
router.get('/schedules', authenticateJWT, async (req, res) => {
    try {
        const schedules = await prisma.schedule.findMany({
            where: { userId: req.user.userId },
            include: { user: true },
        });
        res.json(schedules);
    } catch (error) {
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Create a new schedule (requires authentication)
router.post('/schedules', authenticateJWT, async (req, res) => {
    const { date } = req.body;

    try {
        const newSchedule = await prisma.schedule.create({
            data: {
                date: new Date(date),
                userId: req.user.userId,
            },
        });
        res.status(201).json(newSchedule);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

export default router;
