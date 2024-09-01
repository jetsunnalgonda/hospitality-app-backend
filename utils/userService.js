import prisma from './prisma.js';

export async function createNewUser({ username, name, email, role, hashedPassword, avatars }) {
    return await prisma.user.create({
        data: {
            username,      // Optional
            name,          // Required
            email,         // Required
            password: hashedPassword, // Required
            role,          // Required
            // avatars: avatars.length > 0 ? { create: avatars.map(url => ({ url })) } : undefined, // Handle avatars
            avatars: avatars.length > 0 ? { create: avatars } : undefined,
        },
        include: {
            avatars: true
        }
    });
}

// Function to find a user by username
export const findUserByUsername = async (username) => {
    return await prisma.user.findUnique({
        where: { username }
    });
};