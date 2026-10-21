'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, LogOut } from 'lucide-react';

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleSignOut = () => {
    // TODO: ใส่ Logic สำหรับออกจากระบบ (NextAuth signOut)
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
        
        {/* ไอคอนนาฬิกา / รอดำเนินการ */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-50 text-amber-500">
          <Clock className="h-8 w-8 animate-pulse" />
        </div>

        <div>
          <h2 className="mt-4 text-2xl font-bold text-gray-950">
            บัญชีของคุณกำลังรอการอนุมัติ
          </h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            ระบบได้รับข้อมูลการเข้าสู่ระบบด้วย Google ของคุณเรียบร้อยแล้ว <br />
            กรุณารอผู้ดูแลระบบ (Admin) ตรวจสอบและอนุมัติสิทธิ์การเข้าใช้งาน 
            <strong className="text-gray-900 block mt-1">Big Ultra Works</strong>
          </p>
        </div>

        <div className="border-t border-gray-100 pt-6 mt-6">
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-lg p-4 text-xs text-amber-800 mb-6 text-left">
            💡 <strong>คำแนะนำ:</strong> หลังจากผู้ดูแลระบบอนุมัติสิทธิ์แล้ว คุณสามารถกดปุ่มรีเฟรชหน้าจอหรือเข้าสู่ระบบใหม่อีกครั้งเพื่อใช้งานระบบได้ทันที
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-gray-500" />
            <span>ออกจากระบบ (Sign Out)</span>
          </button>
        </div>

      </div>
    </div>
  );
}