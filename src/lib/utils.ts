import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/utils/db'; 
import { User } from '@/types/type';

const JWT_SECRET = process.env.JWT_SECRET;

export async function fetcher<JSON = any>(
    input: RequestInfo,
    init?: RequestInit
): Promise<JSON> {
    const res = await fetch(input, init);

    if (!res.ok) {
        const json = await res.json();
        if (json.error) {
            const error = new Error(json.error) as Error & {
                status: number
            };
            error.status = res.status;
            throw error;
        } else {
            throw new Error('An unexpected error occurred');
        }
    }

    return res.json();
}

export function formatDate(input: string | number | Date): string {
    const date = new Date(input);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

export async function signToken(payload: any, options: any) {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign(payload, JWT_SECRET, options);
    console.log('signToken: token', token);
    return token;
}

export async function verifyToken(token: string) {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    console.log('verifyToken: token', token);
    return jwt.verify(token, JWT_SECRET);
}

export function jsonResponse(status: number, data: any, init?: ResponseInit) {
    return NextResponse.json(data, { ...init, status });
}

// New function to get user by ID from MySQL
export async function getUserById(userId: string) {
    const [user] = await query<User[]>('SELECT * FROM Users WHERE id = ?', [userId]);
    return user;
}

// New function to check if a user exists in MySQL
export async function userExists(email: string): Promise<boolean> {
    const [user] = await query<User[]>('SELECT id FROM Users WHERE email = ?', [email]);
    return !!user;
}