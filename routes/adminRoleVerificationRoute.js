// routes/adminRoleVerificationRoute.js
import express from 'express';
import prisma from '../utils/prisma.js';
import { authenticateJWT } from '../utils/authUtils.js';

const router = express.Router();

router.post('/verify-role', authenticateJWT, authenticateAdmin, async (req, res) => {
  const { userId, newRole } = req.body;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

function authenticateAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}

export default router;
