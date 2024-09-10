import express from 'express';
import cors from 'cors';
import corsMiddleware from './cors.js';


const setupMiddleware = (app) => {
    // CORS Middleware
    // app.use((req, res, next) => {
    //     console.log('Request received:', req.method, req.url);
    //     console.log('Request headers:', req.headers);
    //     next();
    // });

    app.use(corsMiddleware);
    app.use(cors());

    // app.use((req, res, next) => {
    //     console.log('Response headers:', res.getHeaders());
    //     next();
    // });
    // app.options('*', cors()); // Respond to preflight requests

    // Middleware to parse JSON bodies
    app.use(express.json());
};

export default setupMiddleware;
