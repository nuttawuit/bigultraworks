import React, { Suspense } from 'react';
import { sql } from '@/lib/db';
import { Users, Shield, CheckCircle2, XCircle, Clock, User as UserIcon } from 'lucide-react';
import { revalidatePath } from 'next/cache';

// Server Action สำหรับอัปเดตสถานะและบทบาท (Role) ของ User
async function updateUserAction(formData: FormData) {
  'use server';
  const userId = formData.get('userId') as string;
  const status = formData.get('status') as string;
  const role = formData.get('role') as string;

  if (userId) {
    await sql`
      UPDATE users 
      SET status = ${status}, role = ${role} 
      WHERE id = ${userId}
    `;

    revalidatePath('/admin/users');
  }
}

// คอมเพนเนนต์ดึงข้อมูลผู้ใช้จาก Neon DB
async function UsersTable() {
  const users = await sql`
    SELECT id, name, email, image, role, status, created_at 
    FROM users 
    ORDER BY created_at DESC
  `;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ผู้ใช้งาน</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">สถานะสิทธิ์</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">บทบาท (Role)</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">วันที่สมัคร</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                  ไม่พบข้อมูลผู้ใช้งานในระบบ
                </td>
              </tr>
            ) : (
              users.map((user: any) => {
                const formId = `user-form-${user.id}`;
                return (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* คอลัมน์ที่ 1: ผู้ใช้งาน (ใช้ UserIcon เป็นมาตรฐาน) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <form id={formId} action={updateUserAction}>
                        <input type="hidden" name="userId" value={user.id} />
                      </form>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* คอลัมน์ที่ 2: สถานะสิทธิ์ */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> อนุมัติแล้ว
                        </span>
                      )}
                      {user.status === 'WAITING_APPROVAL' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 animate-pulse" /> รออนุมัติ
                        </span>
                      )}
                      {user.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" /> ไม่อนุมัติ
                        </span>
                      )}
                    </td>

                    {/* คอลัมน์ที่ 3: บทบาท (Role) */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <select
                          name="role"
                          form={formId}
                          defaultValue={user.role || 'USER'}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 font-semibold cursor-pointer"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </div>
                    </td>

                    {/* คอลัมน์ที่ 4: วันที่สมัคร */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('th-TH') : '-'}
                    </td>

                    {/* คอลัมน์ที่ 5: ปุ่มจัดการ */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="submit"
                          name="status"
                          value="APPROVED"
                          form={formId}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm font-medium"
                        >
                          อนุมัติ
                        </button>
                        <button
                          type="submit"
                          name="status"
                          value="REJECTED"
                          form={formId}
                          className="px-3 py-1.5 bg-rose-600 text-white rounded-md text-xs hover:bg-rose-700 transition-colors cursor-pointer shadow-sm font-medium"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            <span>จัดการผู้ใช้งานระบบ (User Approvals)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ตรวจสอบรายชื่อผู้ใช้งาน ตั้งค่าบทบาท (Role) และอนุมัติสิทธิ์การเข้าใช้งาน
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-12 text-gray-500">กำลังโหลดข้อมูลผู้ใช้งาน...</div>}>
        <UsersTable />
      </Suspense>
    </div>
  );
}