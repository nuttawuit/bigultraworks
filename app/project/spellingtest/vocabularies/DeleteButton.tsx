"use client";

import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  id: string;
  word: string;
  deleteAction: (formData: FormData) => void;
}

export default function DeleteButton({ id, word, deleteAction }: DeleteButtonProps) {
  return (
    <form
      action={deleteAction}
      className="inline"
      onSubmit={(e) => {
        if (!confirm(`คุณต้องการลบคำว่า "${word}" ใช่หรือไม่?`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        title="ลบคำศัพท์"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  );
}