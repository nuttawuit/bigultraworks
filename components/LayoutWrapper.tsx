'use client';

import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // เช็กว่าถ้าเป็นหน้า login ให้แสดงแค่เนื้อหาโล่งๆ เต็มจอ (ไม่มี Sidebar)
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // หน้าอื่นๆ แสดง Sidebar และโครงสร้างปกติของคุณ
  return (
    <div className="flex min-h-screen">
      {children}
    </div>
  );
}