
// components/admin/AdminLayout.tsx
'use client'
import type { ReactNode } from "react";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import UserInfo from "./userInfo";
import RequireAuth from "./RequireAuth";
import { Sidebar } from "../common/Sidebar";
import "../../styles/admin-fonts.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <RequireAuth>
      <div className="flex flex-col min-h-screen bg-gray-50 md:flex-row" style={{ fontFamily: 'sfprodisplay, sans-serif' }}>
        <aside className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} hidden md:block`}>
          <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        </aside>

        {/* Mobile sidebar - separate instance */}
        <div className="md:hidden">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="w-full px-6 py-4 bg-white border-b border-gray-200 shadow-sm flex justify-between items-center backdrop-blur-sm bg-white/95 sticky top-0 z-30">
            <h1 className="text-lg font-semibold text-gray-900">Bảng điều khiển</h1>
            <UserInfo />
          </header>

          <main className="flex-1 p-2 sm:p-6 overflow-auto">
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}