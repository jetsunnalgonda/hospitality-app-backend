import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT } from '../utils/authUtils.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all scripts for the logged-in user
router.get('/scripts', authenticateJWT, async (req, res) => {
  console.log('Received GET /scripts request');
  console.log('User:', req.user);

  const userId = req.user.id;
  console.log('User ID:', userId);

  try {
    const scripts = await prisma.script.findMany({
      where: { userId },
    });
    console.log('Fetched scripts:', scripts);
    res.json(scripts);
  } catch (error) {
    console.error('Error fetching scripts:', error);
    res.status(500).json({ error: 'Failed to fetch scripts' });
  }
});

// Create a new script
router.post('/scripts', authenticateJWT, async (req, res) => {
  console.log('Received POST /scripts request');
  console.log('User:', req.user);

  const { title, content } = req.body;
  console.log('Request body:', req.body);

  const userId = req.user.id;
  console.log('User ID:', userId);

  try {
    const script = await prisma.script.create({
      data: { title, content, userId },
    });
    console.log('Created script:', script);
    res.json(script);
  } catch (error) {
    console.error('Error creating script:', error);
    res.status(500).json({ error: 'Failed to create script' });
  }
});

// Update an existing script
router.put('/scripts/:id', authenticateJWT, async (req, res) => {
  console.log('Received PUT /scripts/:id request');
  console.log('User:', req.user);

  const { id } = req.params;
  const { title, content } = req.body;
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);

  try {
    const script = await prisma.script.update({
      where: { id: parseInt(id) },
      data: { title, content },
    });
    console.log('Updated script:', script);
    res.json(script);
  } catch (error) {
    console.error('Error updating script:', error);
    res.status(500).json({ error: 'Failed to update script' });
  }
});

// Delete a script
router.delete('/scripts/:id', authenticateJWT, async (req, res) => {
  console.log('Received DELETE /scripts/:id request');
  console.log('User:', req.user);

  const { id } = req.params;
  console.log('Request params:', req.params);

  try {
    await prisma.script.delete({
      where: { id: parseInt(id) },
    });
    console.log('Deleted script ID:', id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting script:', error);
    res.status(500).json({ error: 'Failed to delete script' });
  }
});

export default router;
