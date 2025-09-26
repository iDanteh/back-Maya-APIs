import dotenv from 'dotenv';
dotenv.config();

export const PORT = 5000;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES = process.env.JWT_EXPIRES;
