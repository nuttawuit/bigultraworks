import { revalidatePath } from 'next/cache';
import { neon } from '@neondatabase/serverless';
import { Suspense } from 'react';
import VocabList from './VocabList';

const sql = neon(process.env.DATABASE_URL!);

// Server Action: เพิ่มคำศัพท์ (รองรับ imageUrl)
async function addVocab(formData: FormData) {
  'use server';

  const word = formData.get('word') as string;
  const translation = formData.get('translation') as string;
  const categoryId = formData.get('categoryId') as string;
  const imageUrl = formData.get('imageUrl') as string;

  if (!word || !translation) return;

  try {
    await sql`
      INSERT INTO vocabs (word, translation, category_id, image_url)
      VALUES (
        ${word.trim()}, 
        ${translation.trim()}, 
        ${categoryId === 'none' ? null : categoryId},
        ${imageUrl ? imageUrl.trim() : null}
      );
    `;
    revalidatePath('/project/spellingtest/vocabularies');
  } catch (error) {
    console.error('Failed to add vocab:', error);
  }
}

// Server Action: ลบคำศัพท์
async function deleteVocab(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;

  try {
    await sql`DELETE FROM vocabs WHERE id = ${id};`;
    revalidatePath('/project/spellingtest/vocabularies');
  } catch (error) {
    console.error('Failed to delete vocab:', error);
  }
}

// Server Action: แก้ไขคำศัพท์ (รองรับ imageUrl)
async function updateVocab(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const word = formData.get('word') as string;
  const translation = formData.get('translation') as string;
  const categoryId = formData.get('categoryId') as string;
  const imageUrl = formData.get('imageUrl') as string;

  try {
    await sql`
      UPDATE vocabs 
      SET word = ${word.trim()}, 
          translation = ${translation.trim()}, 
          category_id = ${categoryId === 'none' ? null : categoryId},
          image_url = ${imageUrl ? imageUrl.trim() : null}
      WHERE id = ${id};
    `;
    revalidatePath('/project/spellingtest/vocabularies');
  } catch (error) {
    console.error('Failed to update vocab:', error);
  }
}

async function VocabTableSection() {
  let vocabs: any[] = [];
  let categories: any[] = [];

  try {
    const vocabResult = await sql`
      SELECT v.id, v.word, v.translation, v.created_at, v.category_id, v.image_url, c.name as category_name
      FROM vocabs v
      LEFT JOIN categories c ON v.category_id = c.id
      ORDER BY v.created_at DESC;
    `;
    const catResult = await sql`SELECT id, name FROM categories ORDER BY name ASC;`;
    
    vocabs = vocabResult || [];
    categories = catResult || [];
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }

  return (
    <div className="space-y-6">
      {/* ฟอร์มเพิ่มคำศัพท์ */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">➕ เพิ่มคำศัพท์ใหม่</h2>
        <form action={addVocab} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำศัพท์ (English)</label>
            <input
              type="text"
              name="word"
              required
              placeholder="เช่น apple"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำแปล (Thai)</label>
            <input
              type="text"
              name="translation"
              required
              placeholder="เช่น แอปเปิ้ล"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
            <select
              name="categoryId"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="none">-- ทั่วไป / ไม่ระบุ --</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์รูปภาพ (Image URL)</label>
            <input
              type="url"
              name="imageUrl"
              placeholder="https://..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-sm"
            >
              บันทึกคำศัพท์
            </button>
          </div>
        </form>
      </div>

      {/* ตารางแสดงรายการคำศัพท์ */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          📚 รายการคำศัพท์ทั้งหมด ({vocabs?.length || 0} คำ)
        </h2>
        <VocabList vocabs={vocabs || []} categories={categories || []} onDelete={deleteVocab} onUpdate={updateVocab} />
      </div>
    </div>
  );
}

export default function VocabulariesPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการคำศัพท์ (Vocabulary Management)</h1>
          <p className="text-sm text-gray-500">เพิ่มคำศัพท์ รูปภาพ หมวดหมู่ และฝึกออกเสียง</p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-10 text-gray-400">กำลังโหลดข้อมูล...</div>}>
        <VocabTableSection />
      </Suspense>
    </div>
  );
}