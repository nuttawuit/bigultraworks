import { neon } from '@neondatabase/serverless';
import { Suspense } from 'react';
import QuizClient from './QuizClient';

const sql = neon(process.env.DATABASE_URL!);

// ดึงรายการหมวดหมู่ทั้งหมด พร้อมนับจำนวนคำศัพท์ในแต่ละหมวด
async function getCategoriesWithCount() {
  try {
    const categories = await sql`
      SELECT c.id, c.name, COUNT(v.id) as vocab_count
      FROM categories c
      LEFT JOIN vocabs v ON c.id = v.category_id
      GROUP BY c.id, c.name
      ORDER BY c.name ASC;
    `;

    const unassigned = await sql`
      SELECT COUNT(*) as count FROM vocabs WHERE category_id IS NULL;
    `;

    const totalVocabs = await sql`SELECT COUNT(*) as count FROM vocabs;`;

    return {
      categories: (categories as any[]) || [],
      unassignedCount: Number(unassigned[0]?.count || 0),
      totalCount: Number(totalVocabs[0]?.count || 0),
    };
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return { categories: [], unassignedCount: 0, totalCount: 0 };
  }
}

// ดึงคำศัพท์ตามหมวดหมู่ที่เลือก (เพิ่ม v.image_url ให้ครบถ้วน)
async function getVocabsByCategoryId(categoryId: string) {
  try {
    let vocabs;
    if (categoryId === 'all') {
      vocabs = await sql`
        SELECT v.id, v.word, v.translation, v.image_url, c.name as category_name
        FROM vocabs v
        LEFT JOIN categories c ON v.category_id = c.id
        ORDER BY RANDOM();
      `;
    } else if (categoryId === 'none') {
      vocabs = await sql`
        SELECT v.id, v.word, v.translation, v.image_url, 'ทั่วไป' as category_name
        FROM vocabs v
        WHERE v.category_id IS NULL
        ORDER BY RANDOM();
      `;
    } else {
      vocabs = await sql`
        SELECT v.id, v.word, v.translation, v.image_url, c.name as category_name
        FROM vocabs v
        JOIN categories c ON v.category_id = c.id
        WHERE v.category_id = ${categoryId}
        ORDER BY RANDOM();
      `;
    }
    return (vocabs as any[]) || [];
  } catch (error) {
    console.error('Failed to fetch vocabs by category:', error);
    return [];
  }
}

// คอมโพ넌ต์หลักที่ทำหน้าที่รับ searchParams และดึงข้อมูล
async function QuizPageContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categoryId = params.category;

  if (!categoryId) {
    const { categories, unassignedCount, totalCount } = await getCategoriesWithCount();

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">📌 เลือกหมวดหมู่คำศัพท์ที่ต้องการทดสอบ</h2>
          
          {totalCount === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีคำศัพท์ในระบบ กรุณาเพิ่มคำศัพท์ก่อนเริ่มทำแบบทดสอบ
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="?category=all"
                className="p-4 border-2 border-blue-100 hover:border-blue-500 bg-blue-50/30 rounded-xl flex items-center justify-between transition group"
              >
                <div>
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600">🌟 ทุกหมวดหมู่ (ทั้งหมด)</h3>
                  <p className="text-xs text-gray-500 mt-1">สุ่มคำศัพท์ทุกหมวดมารวมกัน</p>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {totalCount} คำ
                </span>
              </a>

              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`?category=${cat.id}`}
                  className="p-4 border-2 border-gray-100 hover:border-blue-500 bg-white rounded-xl flex items-center justify-between transition group"
                >
                  <div>
                    <h3 className="font-bold text-gray-800 group-hover:text-blue-600">🏷️ {cat.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">ทดสอบคำศัพท์ในหมวดนี้</p>
                  </div>
                  <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {cat.vocab_count} คำ
                  </span>
                </a>
              ))}

              {unassignedCount > 0 && (
                <a
                  href="?category=none"
                  className="p-4 border-2 border-gray-100 hover:border-blue-500 bg-white rounded-xl flex items-center justify-between transition group"
                >
                  <div>
                    <h3 className="font-bold text-gray-800 group-hover:text-blue-600">📂 ทั่วไป / ไม่ระบุหมวดหมู่</h3>
                    <p className="text-xs text-gray-500 mt-1">คำศัพท์ที่ไม่ได้จัดหมวดหมู่</p>
                  </div>
                  <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {unassignedCount} คำ
                  </span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const vocabs = await getVocabsByCategoryId(categoryId);

  if (vocabs.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border text-center space-y-4">
        <p className="text-gray-600">ไม่พบคำศัพท์ในหมวดหมู่นี้</p>
        <a
          href="/project/spellingtest/quiz"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          ← กลับไปเลือกหมวดหมู่ใหม่
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border shadow-sm">
        <span className="text-sm font-medium text-gray-600">
          🎯 กำลังทดสอบหมวดหมู่: <span className="font-bold text-blue-600">
            {categoryId === 'all' ? 'ทุกหมวดหมู่' : categoryId === 'none' ? 'ทั่วไป' : vocabs[0]?.category_name}
          </span>
        </span>
        <a
          href="/project/spellingtest/quiz"
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition"
        >
          🔄 เปลี่ยนหมวดหมู่
        </a>
      </div>

      <QuizClient vocabs={vocabs} />
    </div>
  );
}

export default function QuizPage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">📝 แบบทดสอบสะกดคำศัพท์</h1>
        <p className="text-sm text-gray-500">ฟังเสียงอ่าน พิมพ์หรือเขียนลายมือตอบ และจับเวลา</p>
      </div>

      <Suspense fallback={<div className="text-center py-10 text-gray-400">กำลังโหลดหมวดหมู่แบบทดสอบ...</div>}>
        <QuizPageContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}