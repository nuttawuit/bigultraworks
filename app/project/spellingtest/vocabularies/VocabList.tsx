'use client';

import { useState } from 'react';

interface Vocab {
  id: string;
  word: string;
  translation: string;
  category_id?: string;
  category_name?: string;
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function VocabList({
  vocabs = [],
  categories = [],
  onDelete,
  onUpdate,
}: {
  vocabs: Vocab[];
  categories: Category[];
  onDelete: (formData: FormData) => void;
  onUpdate: (formData: FormData) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handlePlaySound = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('เบราว์เซอร์นี้ไม่รองรับระบบออกเสียง');
    }
  };

  if (!vocabs || vocabs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        ยังไม่มีคำศัพท์ในระบบ ลองเพิ่มคำศัพท์แรกด้านบนดูครับ
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b bg-gray-50 text-gray-600 text-sm">
            <th className="py-3 px-4 w-16">รูปภาพ</th>
            <th className="py-3 px-4">คำศัพท์ (English)</th>
            <th className="py-3 px-4">คำแปล (Thai)</th>
            <th className="py-3 px-4">หมวดหมู่</th>
            <th className="py-3 px-4 text-center">ฟังเสียง</th>
            <th className="py-3 px-4 text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {vocabs.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50/50">
              {editingId === item.id ? (
                <td colSpan={6} className="py-3 px-4 bg-blue-50/40">
                  <form
                    action={(formData) => {
                      onUpdate(formData);
                      setEditingId(null);
                    }}
                    className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center"
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      type="url"
                      name="imageUrl"
                      defaultValue={item.image_url || ''}
                      placeholder="Image URL"
                      className="px-3 py-1.5 border rounded text-sm bg-white"
                    />
                    <input
                      type="text"
                      name="word"
                      defaultValue={item.word}
                      required
                      className="px-3 py-1.5 border rounded text-sm bg-white"
                    />
                    <input
                      type="text"
                      name="translation"
                      defaultValue={item.translation}
                      required
                      className="px-3 py-1.5 border rounded text-sm bg-white"
                    />
                    <select
                      name="categoryId"
                      defaultValue={item.category_id || 'none'}
                      className="px-3 py-1.5 border rounded text-sm bg-white"
                    >
                      <option value="none">-- ทั่วไป / ไม่ระบุ --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                      >
                        บันทึก
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1.5 rounded text-xs font-medium"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </form>
                </td>
              ) : (
                <>
                  <td className="py-3 px-4">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.word}
                        className="w-12 h-12 object-cover rounded-lg border shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        ไม่มีรูป
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{item.word}</td>
                  <td className="py-3 px-4 text-gray-600">{item.translation}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {item.category_name || 'ทั่วไป'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handlePlaySound(item.word)}
                      className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-xs font-medium transition"
                    >
                      🔊 ฟังเสียง
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(item.id)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-600 px-2.5 py-1 rounded text-xs font-medium transition"
                    >
                      ✏️ แก้ไข
                    </button>
                    <form action={onDelete} className="inline">
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        onClick={(e) => {
                          if (!confirm(`คุณต้องการลบคำว่า "${item.word}" ใช่หรือไม่?`)) {
                            e.preventDefault();
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded text-xs font-medium transition"
                      >
                        🗑️ ลบ
                      </button>
                    </form>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}