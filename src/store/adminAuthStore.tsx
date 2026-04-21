import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { adminApi, Admin } from "@/lib/adminApi";

interface AdminAuthState {
  admin: Admin | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("sw_admin_token");
    const a = localStorage.getItem("sw_admin");
    if (t && a) setAdmin(JSON.parse(a));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await adminApi.login(email, password);
    setAdmin(res.data.admin);
    localStorage.setItem("sw_admin_token", res.data.token);
    localStorage.setItem("sw_admin", JSON.stringify(res.data.admin));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("sw_admin_token");
    localStorage.removeItem("sw_admin");
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isLoggedIn: !!admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
