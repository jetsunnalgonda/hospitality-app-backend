import cors from 'cors';

// Define the CORS options
const corsOptions = {
    // origin: process.env.ALLOWED_ORIGINS || '*', 
    origin: '*', 
    // origin: 'https://localeconnect-frontend-f3009180edf8.herokuapp.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    // credentials: true, 
};

// Create the CORS middleware
const corsMiddleware = cors(corsOptions);

export default corsMiddleware;


// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = 'The CORS policy for this site does not ' +
//                   'allow access from the specified Origin.';
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));