import { revalidatePath } from 'next/cache';
import { neon } from '@neondatabase/serverless';
import { Suspense } from 'react';

const sql = neon(process.env.DATABASE_URL!);

// Server Action สำหรับเพิ่มหมวดหมู่ใหม่
async function addCategory(formData: FormData) {
  'use server';

  const name = formData.get('name') as string;

  if (!name) return;

  try {
    await sql`
      INSERT INTO categories (name)
      VALUES (${name.trim()})
      ON CONFLICT (name) DO NOTHING;
    `;
    revalidatePath('/project/spellingtest/categories');
  } catch (error) {
    console.error('Failed to add category:', error);
  }
}

// คอมโพ넌ต์ดึงและแสดงรายการหมวดหมู่ (รองรับ Suspense)
async function CategoryContent() {
  let categories: any[] = [];

  try {
    const rows = await sql`
      SELECT id, name, created_at
      FROM categories
      ORDER BY created_at DESC;
    `;
    categories = rows || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }

  return (
    <div className="space-y-6">
      {/* ฟอร์มเพิ่มหมวดหมู่ */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">➕ เพิ่มหมวดหมู่ใหม่</h2>
        <form action={addCategory} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              name="name"
              required
              placeholder="เช่น หมวดวิศวกรรม, หมวดการเดินทาง, คำศัพท์ทั่วไป"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 shadow-sm"
          >
            บันทึกหมวดหมู่
          </button>
        </form>
      </div>

      {/* รายการหมวดหมู่ทั้งหมด */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          📂 รายการหมวดหมู่ทั้งหมด ({categories?.length || 0} หมวดหมู่)
        </h2>

        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ยังไม่มีหมวดหมู่ในระบบ ลองเพิ่มหมวดหมู่แรกด้านบนดูครับ
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat: any) => (
              <div key={cat.id} className="p-4 border rounded-lg flex items-center justify-between bg-gray-50/50">
                <span className="font-medium text-gray-800">🏷️ {cat.name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(cat.created_at).toLocaleDateString('th-TH')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// หน้าหลัก CategoriesPage
export default function CategoriesPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* ส่วนหัว */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการหมวดหมู่คำศัพท์ (Categories)</h1>
          <p className="text-sm text-gray-500">สร้างหมวดหมู่เพื่อจัดกลุ่มคำศัพท์ให้เป็นระเบียบ</p>
        </div>
      </div>

      {/* ห่อด้วย Suspense เพื่อป้องกัน Blocking Route */}
      <Suspense fallback={<div className="text-center py-10 text-gray-400">กำลังโหลดหมวดหมู่...</div>}>
        <CategoryContent />
      </Suspense>
    </div>
  );
}