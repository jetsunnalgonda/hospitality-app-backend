import express from 'express';
import { authenticateJWT } from '../utils/authUtils.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

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

router.post('/scripts', authenticateJWT, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const newScript = await prisma.script.create({
      data: {
        title,
        content,
        userId,  // This assumes that userId is the foreign key to the User model
      },
    });

    console.log('New script created:', newScript);
    res.status(201).json(newScript);
  } catch (error) {
    console.error('Error creating script:', error);
    res.status(500).json({ error: 'Failed to create script' });
  }
});

// Create a new script with potential related updates
router.post('/scripts2', authenticateJWT, async (req, res) => {
  console.log('Received POST /scripts request');
  console.log('User:', req.user);

  const { title, content } = req.body;
  console.log('Request body:', req.body);

  const userId = req.user.id;
  console.log('User ID:', userId);
  console.log('hello world');

  console.log('About to check if the user exists');
  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  console.log('User exists check completed');
  console.log('Result of userExists:', userExists);

  const users = await prisma.user.findMany();
  console.log('Fetched users:', users);

  if (!userExists) {
    console.log(`The user with the id ${userId} does not exist`);
    return res.status(404).json({ error: 'User not found' });
  } else {
    console.log(`The user with the id ${userId} exists`);
  }

  console.log('hello!!!!')
  try {
    // Example: You might want to update the user's data when they create a script
    const userDataUpdate = {
      // Placeholder: If you have data that needs updating
      lastActivity: new Date(),
      // Other fields as needed
    };

    const [script, user] = await prisma.$transaction([
      prisma.script.create({
        data: { title, content, userId },
      }),
      prisma.user.update({
        where: { id: userId },
        data: userDataUpdate,
      }),
    ]);

    console.log('Created script:', script);
    console.log('Updated user:', user);
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
