// utils/authUtils.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from './prisma.js';

// Function to hash passwords
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Authenticate user by email and password
export const authenticateUser = async (email, password) => {
  console.log('Starting authentication process...');

  const user = await prisma.user.findUnique({
    where: { email },
  });

  console.log('User found:', user);

  if (!user) {
    console.log('No user found with this email:', email);
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    console.log('Invalid password for user:', email);
    throw new Error('Invalid credentials');
  }

  console.log('User authenticated successfully:', user);
  return user;
};

// Generate access token
export const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Generate refresh token
export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Middleware to authenticate JWT token
export const authenticateJWT = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const userIdFromRequest = req.body.userId || req.query.userId;

  console.log('Authenticating, token:', token);
  console.log('req.body.userId:', userIdFromRequest);

  if (token) {
    try {
      const user = verifyToken(token); // Verify and decode the access token

      // Compare the userId from the token with the userId in the request
      // if (userIdFromRequest && parseInt(userIdFromRequest) !== user.id) {
      //   console.log('User ID mismatch:', userIdFromRequest, user.id);
      //   // res.status(403).json({ message: 'Forbidden: User ID does not match' });
      //   throw new Error('User ID does not match');
      // }

      // Token is valid and user ID matches; proceed with the request
      req.user = user;
      return next();
    } catch (error) {
      console.error('Token verification failed:', error.message);

      console.log('error.name:', error.name);

      // if (error.name === 'TokenExpiredError') {
      if (error) {
        // Token is expired; try to refresh it using the refresh token
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
          try {
            const decoded = verifyRefreshToken(refreshToken); // Verify refresh token
            const user = await prisma.user.findUnique({ where: { id: decoded.id } });
            
            if (user) {
              const newAccessToken = generateAccessToken(user);
              res.setHeader('Authorization', `Bearer ${newAccessToken}`);
              req.user = user; // Attach user data to the request object
              next(); // Proceed to the next middleware or route handler
            } else {
              res.status(403).json({ message: 'Forbidden: Invalid refresh token' });
            }
          } catch (refreshError) {
            console.error('Refresh token verification failed:', refreshError.message);
            res.status(403).json({ message: 'Forbidden: Invalid refresh token' });
          }
        } else {
          res.status(401).json({ message: 'Unauthorized: No refresh token provided' });
        }
      } else {
        res.status(403).json({ message: 'Forbidden: Invalid token' });
      }
    }
  } else {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
};


export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Function to verify JWT token
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};