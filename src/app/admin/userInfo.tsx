// components/admin/userInfo.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LogOut, User } from "lucide-react";
import { IUser } from "@/lib/types/iuser";

export default function UserInfo() {
  const [user, setUser] = useState<IUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        
        const now = new Date().getTime();
        if (userData.expires && userData.expires > now) {
          setUser(userData.user);
        } else {
          localStorage.removeItem("user");
        }
      }
    } catch (err) {
      console.error("Lỗi đọc user từ localStorage", err);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Đã đăng xuất");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>
      
      <button
        onClick={handleLogout}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group"
        title="Đăng xuất"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}