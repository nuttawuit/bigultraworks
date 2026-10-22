"import client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BarChart3,
  Building2,
  Users,
  Menu,
  ChevronDown,
  ChevronRight,
  LogOut,
  Shield,
  User as UserIcon
} from "lucide-react";
import { useSession, signOut, SessionProvider } from "next-auth/react";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isAuthPage = pathname === "/login" || pathname === "/pending";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleSubMenu = (menuName: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  // หากเป็นหน้า Login หรือ Pending ให้แสดงผลเนื้อหาเต็มหน้าจอ
  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full bg-gray-100 text-gray-900 flex flex-col justify-center items-center">
        {children}
      </div>
    );
  }

  const user = session?.user as any;

  return (
    <div className="h-screen w-full flex bg-gray-50 text-gray-900 overflow-hidden">
      {/* 1. Sidebar ด้านซ้าย */}
      <aside
        className={`bg-slate-900 text-slate-300 p-4 flex flex-col border-r border-slate-800 shrink-0 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex items-center gap-3 mb-8 px-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors shrink-0 cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide leading-tight">BigUltraWorks</h1>
              <p className="text-xs text-slate-400">System Control</p>
            </div>
          )}
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            title="Home"
          >
            <Home className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-medium">Home</span>}
          </Link>

          {user?.role === "ADMIN" && (
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-indigo-400"
              title="User Approvals"
            >
              <Users className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="font-medium">User Approvals</span>}
            </Link>
          )}

          <div>
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                  setOpenMenus({ Dashboard: true });
                } else {
                  toggleSubMenu("Dashboard");
                }
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="font-medium">Dashboard</span>}
              </div>
              {!isCollapsed && (
                <span>
                  {openMenus["Dashboard"] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
              )}
            </button>

            {!isCollapsed && openMenus["Dashboard"] && (
              <div className="pl-8 py-1 space-y-1 border-l border-slate-800 ml-5 mt-1">
                <Link href="/dashboard" className="block px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-800/50">
                  Overview
                </Link>
                <Link href="/dashboard/analytics" className="block px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-800/50">
                  Analytics
                </Link>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                  setOpenMenus({ Projects: true });
                } else {
                  toggleSubMenu("Projects");
                }
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="font-medium">Projects</span>}
              </div>
              {!isCollapsed && (
                <span>
                  {openMenus["Projects"] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
              )}
            </button>

            {!isCollapsed && openMenus["Projects"] && (
              <div className="pl-6 py-1 space-y-1 border-l border-slate-800 ml-5 mt-1">
                <Link href="/project/spellingtest/quiz" className="block px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-800/50">
                  Spelling Test
                </Link>
                <div>
                  <button
                    onClick={() => toggleSubMenu("PostTension")}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer"
                  >
                    <span>ระบบจัดการคำศัพท์</span>
                    <span>
                      {openMenus["PostTension"] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </span>
                  </button>

                  {openMenus["PostTension"] && (
                    <div className="pl-4 py-1 space-y-1 border-l border-slate-800/60 ml-3 mt-1">
                      <Link href="/project/spellingtest/vocabularies" className="block px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800/30">
                        บันทึกคำศัพท์
                      </Link>
                      <Link href="/project/spellingtest/categories" className="block px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800/30">
                        บันทึกหมวดหมู่
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {!isCollapsed && (
          <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 px-2">
            © 2026 Big Ultra Works
          </div>
        )}
      </aside>

      {/* 2. พื้นที่เนื้อหาหลักด้านขวา */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b bg-white px-8 flex items-center justify-between shrink-0 shadow-sm">
          <span className="text-sm font-medium text-gray-600">Workspace / System Control</span>

          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="text-xs text-gray-400">Loading...</div>
            ) : user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
                  <UserIcon className="w-5 h-5" />
                </div>

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
            ) : null}

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200 shadow-xs"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">ออกจากระบบ</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SessionProvider>
  );
}