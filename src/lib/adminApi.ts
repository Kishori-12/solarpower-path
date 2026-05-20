const BASE = "http://127.0.0.1:5000";

function getToken() {
  return localStorage.getItem("sw_admin_token");
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

export const adminApi = {
  login: (email: string, password: string) =>
    req<AdminAuthResponse>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getAnalytics: () => req<{ data: Analytics }>("/admin/analytics"),
  getUsers: () => req<{ data: AdminUser[] }>("/admin/users"),

  getVendors: (status?: string) =>
    req<{ data: AdminVendor[] }>(`/admin/vendors${status ? `?status=${status}` : ""}`),
  getVendorDetail: (id: string) => req<{ data: AdminVendor }>(`/admin/vendors/${id}`),
  approveVendor: (id: string) => req(`/admin/vendor/approve/${id}`, { method: "PUT" }),
  rejectVendor: (id: string, reason: string) =>
    req(`/admin/vendor/reject/${id}`, { method: "PUT", body: JSON.stringify({ reason }) }),

  getSchemes: () => req<{ data: AdminScheme[] }>("/admin/schemes"),
  createScheme: (data: SchemeInput) =>
    req<{ data: AdminScheme }>("/admin/schemes", { method: "POST", body: JSON.stringify(data) }),
  updateScheme: (id: number, data: Partial<SchemeInput>) =>
    req<{ data: AdminScheme }>(`/admin/schemes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteScheme: (id: number) => req(`/admin/schemes/${id}`, { method: "DELETE" }),
};

// ── Types ──────────────────────────────────────────────────────────────────
export interface AdminAuthResponse {
  success: boolean;
  data: { admin: Admin; token: string };
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface AdminVendor {
  id: string;
  company_name: string;
  email: string;
  phone: string;
  location: string;
  price_per_kw: number;
  experience_years: number;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  rating: number;
  doc_count: number;
  documents: VendorDoc[];
  created_at: string;
  updated_at: string;
}

export interface VendorDoc {
  id: string;
  doc_type: string;
  filename: string;
  original_name: string;
  file_size: number;
  status: string;
  uploaded_at: string;
}

export interface AdminScheme {
  id: number;
  name: string;
  provider: string;
  subsidy_percent: number;
  max_subsidy_inr: number;
  eligibility: string;
  link: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchemeInput {
  name: string;
  provider: string;
  subsidy_percent: number;
  max_subsidy_inr: number;
  eligibility: string;
  link: string;
  active: boolean;
}

export interface Analytics {
  overview: {
    total_users: number;
    total_vendors: number;
    total_calculations: number;
    total_schemes: number;
    total_savings_inr: number;
    total_co2_offset_kg: number;
    avg_system_size_kw: number;
  };
  vendor_status: { pending: number; approved: number; rejected: number };
  location_distribution: Record<string, number>;
  registrations: {
    users: { date: string; count: number }[];
    vendors: { date: string; count: number }[];
  };
}
