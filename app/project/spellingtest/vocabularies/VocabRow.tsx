"use client";

import { useState } from "react";
import { Trash2, Pencil, Check, X } from "lucide-react";

interface VocabRowProps {
  item: {
    id: string;
    word: string;
    translation: string;
    category_id: string;
    category_name: string;
    image_url: string;
  };
  categoryList: any[];
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
}

export default function VocabRow({ item, categoryList, updateAction, deleteAction }: VocabRowProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <tr className="hover:bg-gray-50/75 transition-colors">
      {isEditing ? (
        // โหมดกำลังแก้ไข (Inline Edit Form)
        <td colSpan={5} className="py-3 px-6 bg-indigo-50/40">
          <form
            action={async (formData) => {
              await updateAction(formData);
              setIsEditing(false);
            }}
            className="flex flex-wrap items-center gap-3"
          >
            <input type="hidden" name="id" value={item.id} />
            <input
              type="text"
              name="word"
              defaultValue={item.word}
              required
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32"
              placeholder="คำศัพท์"
            />
            <input
              type="text"
              name="translation"
              defaultValue={item.translation}
              required
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32"
              placeholder="คำแปล"
            />
            <select
              name="category_id"
              defaultValue={item.category_id || ""}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36"
            >
              <option value="">-- เลือกหมวดหมู่ --</option>
              {categoryList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              type="url"
              name="image_url"
              defaultValue={item.image_url || ""}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-[180px]"
              placeholder="URL รูปภาพ (ถ้ามี)"
            />

            <div className="flex items-center gap-1 ml-auto">
              <button
                type="submit"
                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                title="บันทึก"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors cursor-pointer"
                title="ยกเลิก"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        </td>
      ) : (
        // โหมดแสดงผลปกติ
        <>
          <td className="py-4 px-6">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.word}
                className="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-2xs"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                No Img
              </div>
            )}
          </td>
          <td className="py-4 px-6 font-semibold text-gray-900">{item.word}</td>
          <td className="py-4 px-6 text-gray-700">{item.translation}</td>
          <td className="py-4 px-6">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              {item.category_name || "ไม่ระบุหมวดหมู่"}
            </span>
          </td>
          <td className="py-4 px-6 text-right space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer inline-block"
              title="แก้ไข"
            >
              <Pencil className="w-4 h-4" />
            </button>

            <form
              action={deleteAction}
              className="inline"
              onSubmit={(e) => {
                if (!confirm(`คุณต้องการลบคำว่า "${item.word}" ใช่หรือไม่?`)) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={item.id} />
              <button
                type="submit"
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="ลบคำศัพท์"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          </td>
        </>
      )}
    </tr>
  );
}