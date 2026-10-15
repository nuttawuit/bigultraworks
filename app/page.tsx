// app/page.js
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">ยินดีต้อนรับสู่ระบบ</h1>
      <p className="mt-2 text-gray-600">หน้าแรกของเว็บ</p>
      
      {/* การ Link ไปหน้าอื่น ใช้ <Link> ของ Next.js จะโหลดไวและไม่ Refresh หน้า */}
      <div className="mt-4">
        <Link 
          href="/dashboard" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}