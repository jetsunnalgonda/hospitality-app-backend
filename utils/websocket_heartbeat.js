import { WebSocketServer } from 'ws';

const clients = new Set(); // Store all connected clients

// Initialize WebSocket Server
export function initializeWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, request) => {
    clients.add(ws); // Add the new connection to the set of clients

    console.log('New client connected via WebSocket');

    // Extract userId from the connection URL (e.g., ws://localhost:3020/?userId=2)
    const urlParams = new URLSearchParams(request.url.split('?')[1]);
    const userId = urlParams.get('userId');
    ws.userId = userId; // Associate the WebSocket connection with the userId
    console.log('Connected client userId:', ws.userId);

    // Set up the heartbeat mechanism to keep the connection alive
    startHeartbeat(ws);

    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        const { action, data } = parsedMessage;

        console.log(`[WebSocket Server] Received action: ${action} from userId: ${ws.userId}`);

        // Handle different actions
        handleUserAction(action, ws, data);

      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      clients.delete(ws); // Remove the client when the connection closes
      stopHeartbeat(ws);  // Stop heartbeat when the connection is closed
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error on userId: ${ws.userId}`, error);
    });
  });
}

// Start a heartbeat ping-pong mechanism to detect inactive clients
function startHeartbeat(ws) {
  ws.isAlive = true; // Initially assume the client is alive

  // Listen for pong responses from the client
  ws.on('pong', () => {
    console.log('Received pong from client:', ws.userId);
    ws.isAlive = true; // Reset the isAlive flag when a pong is received
  });

  // Send a ping every 30 seconds and expect a pong response
  const keepAliveInterval = setInterval(() => {
    if (!ws.isAlive) {
      console.log(`Terminating inactive connection for userId: ${ws.userId}`);
      ws.terminate(); // If no pong was received, terminate the connection
      return;
    }

    ws.isAlive = false; // Reset the isAlive flag
    if (ws.readyState === ws.OPEN) {
      console.log(`Sending ping to userId: ${ws.userId}`);
      ws.ping(); // Send a ping to the client
    }
  }, 30000); // Ping every 30 seconds

  // Attach the keepAliveInterval to the WebSocket object so we can clear it later
  ws.keepAliveInterval = keepAliveInterval;
}

// Stop the heartbeat when the connection closes
function stopHeartbeat(ws) {
  clearInterval(ws.keepAliveInterval); // Clear the interval
}

// Generalized handler for user actions (unchanged)
function handleUserAction(action, ws, data) {
  switch (action) {
    case 'MESSAGE':
      broadcastMessage(action, ws, data);
      break;
    case 'LIKE':
    case 'UPDATE_LIKE_ID':
    case 'REMOVE_LIKE':
    case 'COMMENT':
    case 'FOLLOW':
      broadcastNotification(action, ws, data);
      break;
    default:
      console.warn('Unknown action:', action);
  }
}

// Function to broadcast a message to a specific user (unchanged)
function broadcastMessage(actionType, ws, data) {
  console.log(`[WebSocket Server] User ${ws.userId} performed ${actionType} on user with ID: ${data.sendeeId}`);
  broadcastMessageToUser(data.sendeeId, {
    action: 'message',
    data: {
      type: actionType,
      userId: ws.userId,
      userName: data.userName,
      tempId: data.tempId,
      referenceId: data.referenceId,
      createdAt: data.createdAt,
      conversationId: data.conversationId,
      text: data.text,
    },
  });
}

// Function to broadcast notifications (unchanged)
function broadcastNotification(actionType, ws, data) {
  console.log(`[WebSocket Server] User ${ws.userId} performed ${actionType} on user with ID: ${data.userId}`);
  broadcastMessageToUser(data.userId, {
    action: 'notification',
    data: {
      type: actionType,
      userId: ws.userId,
      userName: data.userName,
      conversationId: data.conversationId,
      text: data.text,
      createdAt: data.createdAt,
      message: 'broadcast notification',
    },
  });
}

// Function to broadcast a message to a specific user (unchanged)
function broadcastMessageToUser(targetUserId, message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.userId === targetUserId) {
      client.send(JSON.stringify(message));
      console.log('[WebSocket Server] Broadcasted message to user:', targetUserId);
      return;
    }
  });
}

export { clients };
