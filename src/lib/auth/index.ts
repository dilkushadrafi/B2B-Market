import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { User } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-secret-key'
);

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    [key: string]: any; // Allow other claims
}

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const generateToken = async (user: Partial<User>): Promise<string> => {
    const payload: JWTPayload = {
        userId: user._id!,
        email: user.email!,
        role: user.role!,
    };

    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);
};

export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as JWTPayload;
    } catch (error) {
        return null;
    }
};

export const getUserFromToken = async (authHeader: string | null): Promise<JWTPayload | null> => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    return verifyToken(token);
};
