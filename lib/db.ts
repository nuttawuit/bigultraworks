import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables.');
}

// สร้าง SQL Client สำหรับใช้งานคำสั่ง SQL ดิบ
export const sql = neon(process.env.DATABASE_URL);