import express from 'express';
import cors from 'cors';
import corsMiddleware from './cors.js';


const setupMiddleware = (app) => {
    // CORS Middleware
    app.use(corsMiddleware);
    app.options('*', cors()); // Respond to preflight requests

    // Middleware to parse JSON bodies
    app.use(express.json());
};

export default setupMiddleware;
