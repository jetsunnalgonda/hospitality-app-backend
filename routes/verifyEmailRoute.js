// routes/verifyEmailRoute.js
import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

router.get('/verify-email/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const verification = await prisma.emailVerification.findUnique({
            where: { token },
        });

        if (!verification || verification.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        await prisma.user.update({
            where: { id: verification.userId },
            data: { emailVerified: true },
        });

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;

