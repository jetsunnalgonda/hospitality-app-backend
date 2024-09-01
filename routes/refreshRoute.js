import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../utils/authUtils.js'
import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

const router = express.Router();

router.post('/refresh', async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    console.log('Decoded refresh token:', decoded);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },  // Ensure you're using the ID from the token
    });

    if (!user) {
      return res.sendStatus(403); // Forbidden
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({ token: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    res.sendStatus(403); // Forbidden
  }
});

// router.post('/refresh', async (req, res) => {
//   const refreshToken = req.body.token;

//   console.log('Refresh request received', refreshToken);

//   if (!refreshToken) {
//     return res.status(401).json({ message: 'Refresh Token is required' });
//   }

//   try {
//     // Verify if the refresh token is valid
//     const user = verifyRefreshToken(refreshToken);
//     console.log('Current user:', user);
//     console.log('user id', user.id);

//     // Generate new access and refresh tokens
//     const newAccessToken = generateAccessToken(user.id);
//     const newRefreshToken = generateRefreshToken(user.id);

//     console.log('tokens refreshed', newAccessToken, newRefreshToken)

//     const decodedRefreshToken = jwt.verify(newRefreshToken, process.env.JWT_REFRESH_SECRET);
//     console.log('Decoded Refresh Token:', decodedRefreshToken);

//     // Optionally, store the new refresh token in the database or invalidate the old one

//     res.json({
//       token: newAccessToken,
//       refreshToken: newRefreshToken,
//     });
//   } catch (error) {
//     console.error('Failed to refresh token:', error);
//     return res.status(403).json({ message: 'Invalid Refresh Token' });
//   }
// });

export default router;
