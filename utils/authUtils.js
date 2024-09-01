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
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Generate refresh token
export const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Middleware to authenticate JWT token
export const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Authenticating, token:', token);

  if (token) {
    try {
      const user = verifyToken(token); // Verify the access token
      req.user = user; // Attach user data to the request object
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Token verification failed:', error.message);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      } else {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
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