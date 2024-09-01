import multer from 'multer';
import path from 'path';

// Define multer storage configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Directory for storing uploaded files
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
//         cb(null, `${uniqueSuffix}-${file.originalname}`);
//     }
// });

// // Export a single instance of multer configured with the storage
// export const upload = multer({ storage: storage });



// Define multer storage configuration using memory storage
const storage = multer.memoryStorage(); // Store files in memory as Buffer

// Export a single instance of multer configured with the memory storage
export const upload = multer({ storage: storage });