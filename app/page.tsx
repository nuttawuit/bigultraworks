import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userStatus = (session.user as any)?.status;

  if (userStatus === "WAITING_APPROVAL" || userStatus === "REJECTED") {
    redirect("/pending");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Welcome to Big Ultra Works</h1>
      <p className="text-gray-600">ยินดีต้อนรับเข้าสู่ระบบควบคุมส่วนกลาง ระบบอนุมัติสิทธิ์ทำงานปกติแล้วครับ!</p>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <p className="text-sm text-gray-700">เข้าสู่ระบบด้วยอีเมล: <strong className="text-indigo-600">{session.user?.email}</strong></p>
        <p className="text-sm text-gray-700 mt-1">สถานะสิทธิ์: <span className="text-emerald-600 font-semibold">{userStatus}</span></p>
      </div>
    </div>
  );
}