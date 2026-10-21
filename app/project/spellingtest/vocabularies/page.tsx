export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { sql } from "@vercel/postgres";
import Link from "next/link";
import { Plus, Trash2, BookOpen, Layers } from "lucide-react";

export default async function VocabulariesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userStatus = (session.user as any)?.status;
  if (userStatus === "WAITING_APPROVAL" || userStatus === "REJECTED") {
    redirect("/pending");
  }

  let vocabList: any[] = [];
  let categoryList: any[] = [];

  try {
    const vocabResult = await sql`
      SELECT v.id, v.word, v.translation, v.created_at, v.category_id, v.image_url, c.name as category_name
      FROM vocabs v
      LEFT JOIN categories c ON v.category_id = c.id
      ORDER BY v.created_at DESC;
    `;
    vocabList = vocabResult.rows;

    const categoryResult = await sql`
      SELECT id, name, created_at
      FROM categories
      ORDER BY created_at DESC;
    `;
    categoryList = categoryResult.rows;
  } catch (error) {
    console.error("Failed to fetch data from Neon:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            บันทึกคำศัพท์ (Vocabularies)
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">จัดการรายการคำศัพท์ทั้งหมดในระบบ Spelling Test</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/project/spellingtest/categories"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4 text-gray-500" />
            จัดการหมวดหมู่
          </Link>
        </div>
      </div>

      {/* ตารางแสดงรายการคำศัพท์ */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3.5 px-6">คำศัพท์ (Word)</th>
                <th className="py-3.5 px-6">คำแปล (Translation)</th>
                <th className="py-3.5 px-6">หมวดหมู่ (Category)</th>
                <th className="py-3.5 px-6 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {vocabList.length > 0 ? (
                vocabList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-900">{item.word}</td>
                    <td className="py-4 px-6 text-gray-700">{item.translation}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {item.category_name || "ไม่ระบุหมวดหมู่"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {/* ปุ่มลบหรือจัดการเพิ่มเติมสามารถใส่ตรงนี้ */}
                      <span className="text-xs text-gray-400">ระบบพร้อมใช้งาน</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    ยังไม่มีข้อมูลคำศัพท์ในระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}