'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const user = session.user as any;

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      {/* ฝั่งซ้าย: แสดงชื่อโปรเจกต์หรือสถานะ */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500">Workspace / System Control</span>
      </div>

      {/* ฝั่งขวา: ข้อมูล User และปุ่ม Sign Out */}
      <div className="flex items-center gap-4">
        {/* รูปโปรไฟล์และชื่อ */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          {user.image ? (
            <img 
              src={user.image} 
              alt={user.name || 'User'} 
              className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-xs" 
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          <div className="hidden sm:block text-left">
            <div className="text-sm font-semibold text-gray-800 leading-tight">
              {user.name}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Shield className="w-3 h-3 text-indigo-600" />
              <span>{user.role || 'USER'}</span>
            </div>
          </div>
        </div>

        {/* ปุ่ม Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200 shadow-2xs"
          title="ออกจากระบบ"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">ออกจากระบบ</span>
        </button>
      </div>
    </header>
  );
}