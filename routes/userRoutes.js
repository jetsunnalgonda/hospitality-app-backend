// routes/userRoutes.js
import express from 'express';
import prisma from '../utils/prisma.js';
import { authenticateJWT } from '../utils/authUtils.js';

const router = express.Router();

// Get all users (requires authentication)
router.get('/users', authenticateJWT, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                avatars: true, // Include avatars for each user
                messages: true,          // Include all messages sent by the user
                receivedMessages: true   // Include all messages received by the user
            }
        });
        res.json(users); // Return the fetched users with all related data
    } catch (error) {
        res.status(500).send({ message: 'Internal server error' });
    }
});

export default router;