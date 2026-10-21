import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { sql } from "@/lib/db";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // บังคับให้ Google เด้งหน้าต่างเลือกบัญชีและขอสิทธิ์ใหม่ทุกครั้งที่กด Sign In
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: any }) {
      if (!user.email) return false;

      try {
        // 1. เช็กว่ามีอีเมลนี้ในตาราง users หรือยัง
        const existingUsers = await sql`
          SELECT * FROM users WHERE email = ${user.email}
        `;

        if (existingUsers.length === 0) {
          // 2. ถ้ายังไม่มี ให้บันทึกใหม่โดยตั้ง status เป็น WAITING_APPROVAL
          await sql`
            INSERT INTO users (name, email, image, role, status)
            VALUES (${user.name}, ${user.email}, ${user.image || ''}, 'USER', 'WAITING_APPROVAL')
          `;
        }
        return true;
      } catch (error) {
        console.error("Database error during sign in:", error);
        return false;
      }
    },
    
    // ควบคุมเส้นทางหลังล็อกอินสำเร็จ
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      return baseUrl;
    },

    async session({ session }: { session: any }) {
      if (session.user?.email) {
        // ดึงสถานะและ Role ล่าสุดจาก Neon มาแปะใน session
        const dbUsers = await sql`
          SELECT role, status FROM users WHERE email = ${session.user.email}
        `;
        if (dbUsers.length > 0) {
          session.user.role = dbUsers[0].role;
          session.user.status = dbUsers[0].status;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };