import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { vendorApi, Vendor, VendorRegisterInput } from "@/lib/vendorApi";

interface VendorAuthState {
  vendor: Vendor | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: VendorRegisterInput) => Promise<void>;
  logout: () => void;
  refreshVendor: () => Promise<void>;
}

const VendorAuthContext = createContext<VendorAuthState | null>(null);

export function VendorAuthProvider({ children }: { children: ReactNode }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("sw_vendor_token");
    const v = localStorage.getItem("sw_vendor");
    if (t && v) {
      setToken(t);
      setVendor(JSON.parse(v));
    }
  }, []);

  const persist = (v: Vendor, t: string) => {
    setVendor(v);
    setToken(t);
    localStorage.setItem("sw_vendor_token", t);
    localStorage.setItem("sw_vendor", JSON.stringify(v));
  };

  const login = async (email: string, password: string) => {
    const res = await vendorApi.login(email, password);
    persist(res.data.vendor, res.data.token);
  };

  const register = async (data: VendorRegisterInput) => {
    const res = await vendorApi.register(data);
    persist(res.data.vendor, res.data.token);
  };

  const logout = () => {
    setVendor(null);
    setToken(null);
    localStorage.removeItem("sw_vendor_token");
    localStorage.removeItem("sw_vendor");
  };

  const refreshVendor = async () => {
    try {
      const res = await vendorApi.getProfile();
      setVendor(res.data);
      localStorage.setItem("sw_vendor", JSON.stringify(res.data));
    } catch {
      logout();
    }
  };

  return (
    <VendorAuthContext.Provider
      value={{ vendor, token, isLoggedIn: !!token, login, register, logout, refreshVendor }}
    >
      {children}
    </VendorAuthContext.Provider>
  );
}

export function useVendorAuth() {
  const ctx = useContext(VendorAuthContext);
  if (!ctx) throw new Error("useVendorAuth must be used inside VendorAuthProvider");
  return ctx;
}
