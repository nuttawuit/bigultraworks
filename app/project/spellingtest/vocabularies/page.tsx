export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { sql } from "@vercel/postgres";
import Link from "next/link";
import { Plus, BookOpen, Layers } from "lucide-react";
import { revalidatePath } from "next/cache";
import VocabRow from "./VocabRow";

export default async function VocabulariesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userStatus = (session.user as any)?.status;
  if (userStatus === "WAITING_APPROVAL" || userStatus === "REJECTED") {
    redirect("/pending");
  }

  // Server Action: เพิ่มคำศัพท์ (รองรับ image_url)
  async function handleAddVocab(formData: FormData) {
    "use server";
    const word = formData.get("word") as string;
    const translation = formData.get("translation") as string;
    const category_id = formData.get("category_id") as string;
    const image_url = formData.get("image_url") as string;

    if (!word || !translation) return;

    try {
      await sql`
        INSERT INTO vocabs (word, translation, category_id, image_url, created_at)
        VALUES (${word}, ${translation}, ${category_id || null}, ${image_url || null}, NOW())
      `;
      revalidatePath("/project/spellingtest/vocabularies");
    } catch (error) {
      console.error("Failed to add vocab:", error);
    }
  }

  // Server Action: แก้ไขคำศัพท์ (รองรับ image_url)
  async function handleUpdateVocab(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const word = formData.get("word") as string;
    const translation = formData.get("translation") as string;
    const category_id = formData.get("category_id") as string;
    const image_url = formData.get("image_url") as string;

    if (!id || !word || !translation) return;

    try {
      await sql`
        UPDATE vocabs
        SET word = ${word}, translation = ${translation}, category_id = ${category_id || null}, image_url = ${image_url || null}
        WHERE id = ${id}
      `;
      revalidatePath("/project/spellingtest/vocabularies");
    } catch (error) {
      console.error("Failed to update vocab:", error);
    }
  }

  // Server Action: ลบคำศัพท์
  async function handleDeleteVocab(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;

    if (!id) return;

    try {
      await sql`DELETE FROM vocabs WHERE id = ${id}`;
      revalidatePath("/project/spellingtest/vocabularies");
    } catch (error) {
      console.error("Failed to delete vocab:", error);
    }
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
    <div className="space-y-8">
      {/* Header */}
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

      {/* ฟอร์มเพิ่มคำศัพท์ใหม่ */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-600" />
          เพิ่มคำศัพท์ใหม่
        </h2>
        <form action={handleAddVocab} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">คำศัพท์ (Word)</label>
            <input
              type="text"
              name="word"
              required
              placeholder="เช่น Apple"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">คำแปล (Translation)</label>
            <input
              type="text"
              name="translation"
              required
              placeholder="เช่น แอปเปิ้ล"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">หมวดหมู่ (Category)</label>
            <select
              name="category_id"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- เลือกหมวดหมู่ --</option>
              {categoryList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">URL รูปภาพ (Image URL)</label>
            <div className="flex gap-2">
              <input
                type="url"
                name="image_url"
                placeholder="https://... (ถ้ามี)"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                บันทึก
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ตารางแสดงรายการคำศัพท์ */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3.5 px-6 w-20">รูปภาพ</th>
                <th className="py-3.5 px-6">คำศัพท์ (Word)</th>
                <th className="py-3.5 px-6">คำแปล (Translation)</th>
                <th className="py-3.5 px-6">หมวดหมู่ (Category)</th>
                <th className="py-3.5 px-6 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {vocabList.length > 0 ? (
                vocabList.map((item) => (
                  <VocabRow
                    key={item.id}
                    item={item}
                    categoryList={categoryList}
                    updateAction={handleUpdateVocab}
                    deleteAction={handleDeleteVocab}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
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