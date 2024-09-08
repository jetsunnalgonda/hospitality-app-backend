// routes/conversationsRoutes.js
import express from 'express';
import prisma from '../utils/prisma.js';
import { authenticateJWT } from '../utils/authUtils.js';

const router = express.Router();

// Create a new conversation
router.post('/conversations', authenticateJWT, async (req, res) => {
  const { participants, messages } = req.body;

  // Log the incoming request body
  console.log('Incoming POST /conversations request body:', req.body);

  // Ensure participants is an array and has valid data
  if (!participants || !Array.isArray(participants) || participants.length === 0) {
    return res.status(400).json({ error: 'Participants must be a non-empty array of user IDs' });
  }

  try {
    // Log the attempt to create the conversation
    console.log('Creating conversation with participants:', participants);

    // Create the conversation with participants
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: participants.map(userId => ({ id: userId })),
        },
      },
      include: {
        participants: true,  // Include participants in the response
        messages: true,      // Include messages in the response (will be empty if no messages are added)
      },
    });

    // Log successful conversation creation
    console.log('Conversation created successfully:', conversation);

    // Handle adding initial messages, if any are provided
    if (messages && Array.isArray(messages) && messages.length > 0) {
      const createdMessages = await Promise.all(
        messages.map(async (msg) => {
          return await prisma.message.create({
            data: {
              text: msg.text,
              userId: msg.userId,
              conversationId: conversation.id,
            },
          });
        })
      );

      // Log the created messages
      console.log('Messages added to the conversation:', createdMessages);

      // Update conversation with added messages
      conversation.messages = createdMessages;
    }

    res.json(conversation);
  } catch (error) {
    // Log the error for debugging
    console.error('Error creating conversation:', error);

    res.status(400).json({ error: error.message });
  }
});



// Send a message
router.post('/conversations/:id/messages', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { text, userId, status } = req.body;

  try {
    const message = await prisma.message.create({
      data: {
        text,
        status,
        userId, 
        sendeeId,
        conversationId: id,
      },
    });

    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: parseInt(id) },
      include: { user: true, sendee: true },
      orderBy: { timestamp: 'asc' }, // Ensure ordering by timestamp
    });

    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get conversations for a user
router.get('/conversations', authenticateJWT, async (req, res) => {
  // const userId = parseInt(req.query.userId); // Ensure you pass userId as a query parameter
  const userId = req.user.id;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: userId
          }
        }
      },
      include: {
        participants: true, // Include participants if needed
        messages: {
          take: 1, // Optionally include the latest message for preview
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    res.json(conversations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Fetch all conversations for a user
router.get('/users/:userId/conversations', async (req, res) => {
  const { userId } = req.params;

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: parseInt(userId) },
        },
      },
      include: {
        participants: true,
        messages: { take: 1, orderBy: { timestamp: 'desc' } },
      },
    });

    res.json(conversations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a message by its ID
router.put('/messages/:messageId', async (req, res) => {
  const { messageId } = req.params;
  const { text, status } = req.body;

  try {
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        text,
        status,
      },
    });
    res.json(updatedMessage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a message by its ID
router.delete('/messages/:messageId', async (req, res) => {
  const { messageId } = req.params;

  try {
    await prisma.message.delete({
      where: { id: messageId },
    });
    res.status(204).send(); 
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Send a message (with conversationId in the body)
router.post('/messages', authenticateJWT, async (req, res) => {
  console.log("Incoming POST /messages request body:", req.body);
  const userId = req.user.id;

  const { conversationId, text, status, sendeeId } = req.body; // Add sendeeId

  console.log("conversationId:", conversationId);
  console.log("text:", text);
  console.log("userId:", userId);
  console.log("status:", status);
  console.log("sendeeId:", sendeeId); // Log sendeeId for debugging

  try {
    const message = await prisma.message.create({
      data: {
        text,
        status: status || 'delivered',
        userId,
        sendeeId, // Include sendeeId in the message creation
        conversationId: parseInt(conversationId), // Ensure it's an integer
      },
    });

    console.log("Message created successfully:", message);

    res.json(message);
  } catch (error) {
    console.error("Error in POST /messages:", error.message);
    res.status(400).json({ error: error.message });
  }
});


export default router;
