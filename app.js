import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import setupMiddleware from './utils/setupMiddleware.js';
import routes from './routes/index.js';
import { initializeWebSocketServer } from './utils/websocket.js';

dotenv.config();

const app = express();
setupMiddleware(app);


app.use('/', routes);

var server = http.createServer(app)

const PORT = process.env.PORT || 3040;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

initializeWebSocketServer(server);