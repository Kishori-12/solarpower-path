import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, User } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("sw_token");
    const savedUser = localStorage.getItem("sw_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const persist = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem("sw_token", t);
    localStorage.setItem("sw_user", JSON.stringify(u));
  };

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    persist(res.data.user, res.data.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);
    persist(res.data.user, res.data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("sw_token");
    localStorage.removeItem("sw_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
