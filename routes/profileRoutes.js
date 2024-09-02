import express from 'express';
import { upload } from '../multerConfig.js';
import { hashPassword } from '../utils/authUtils.js';
import { uploadAvatarsToS3 } from '../utils/s3Utils.js';
import { authenticateJWT } from '../utils/authUtils.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Fetch user profile (requires authentication)
router.get('/profile', authenticateJWT, async (req, res) => {
    const userId = req.user.id;
    console.log('get /profile endpoint');
    console.log('req.user:', req.user);

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                avatars: true,
            },
        });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Update profile (requires authentication)
router.put('/profile', authenticateJWT, upload.array('avatars', 5), async (req, res) => {
    const { name, bio, email, role, password } = req.body;
    const avatarFiles = req.files;
    const userId = req.user.id;

    try {
        // Prepare data for the update
        const updateData = { name, bio, email, role };

        // If a new password is provided, hash it
        if (!password && password !== undefined) {
            updateData.password = await hashPassword(password);
        }

        // If new avatars are uploaded, handle the S3 upload and include them in the update
        if (avatarFiles && avatarFiles.length > 0) {
            const avatars = await uploadAvatarsToS3(avatarFiles);
            updateData.avatars = {
                deleteMany: {}, // Delete existing avatars
                create: avatars, // Add new avatars
            };
        }

        // Update the user in the database
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: {
                avatars: true, // Include avatars in the response
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);

        // Handle unique constraint errors (e.g., email or username already exists)
        if (error.code === 'P2002') {
            if (error.meta.target.includes('email')) {
                return res.status(400).send({ message: 'A user with this email already exists.' });
            }
            if (error.meta.target.includes('username')) {
                return res.status(400).send({ message: 'A user with this username already exists.' });
            }
        }

        res.status(500).send({ message: 'Internal server error' });
    }
});

export default router;
