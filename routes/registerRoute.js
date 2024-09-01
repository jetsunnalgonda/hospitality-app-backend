import express from 'express';
import { upload } from '../multerConfig.js';
import { hashPassword, generateAccessToken, generateRefreshToken } from '../utils/authUtils.js';
import { uploadAvatarsToS3 } from '../utils/s3Utils.js';
import { createNewUser, findUserByUsername } from '../utils/userService.js';

const router = express.Router();

// Utility function to generate a random username
const generateRandomUsername = () => {
    const timestamp = Date.now(); // Get the current timestamp
    return `user_${timestamp}_${Math.floor(Math.random() * 1000)}`; // Include timestamp and a random number
};

// Ensure the username is unique
const ensureUniqueUsername = async (username) => {
    while (true) {
        const user = await findUserByUsername(username);
        if (!user) return username; // Username is unique
        username = generateRandomUsername(); // Generate a new username
    }
};

router.post('/register', upload.array('avatars', 5), async (req, res) => {
    console.log('Files:', req.files);
    console.log('Body:', req.body);

    try {
        const { username, name, email, role, password } = req.body;
        const avatarFiles = req.files || []; // Default to an empty array if undefined

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).send({ message: 'Name, email, password, and role are required.' });
        }

        let finalUsername = username || generateRandomUsername();
        finalUsername = await ensureUniqueUsername(finalUsername);

        const hashedPassword = await hashPassword(password);
        const avatars = await uploadAvatarsToS3(avatarFiles);

        const newUser = await createNewUser({ username: finalUsername, name, email, role, hashedPassword, avatars });

        const token = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);
        res.status(201).send({ token, refreshToken });
    } catch (error) {
        console.error('Error creating user:', error);

        // Check for PrismaClientKnownRequestError
        if (error.code === 'P2002') {
            if (error.meta.target.includes('email')) {
                return res.status(400).send({ message: 'A user with this email already exists.' });
            }
            if (error.meta.target.includes('username')) {
                return res.status(400).send({ message: 'A user with this username already exists.' });
            }
        }

        res.status(500).send({ message: 'Error creating user', error: error.message });
    }
});

export default router;
