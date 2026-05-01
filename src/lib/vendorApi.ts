const BASE = "http://127.0.0.1:5000/vendor";

function getToken() {
  return localStorage.getItem("sw_vendor_token");
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  // Build headers — never set Content-Type for FormData (browser sets it with boundary)
  const headers: Record<string, string> = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

export const vendorApi = {
  register: (data: VendorRegisterInput) => {
    console.log("📡 Sending vendor registration request with data:", data);
    return req<VendorAuthResponse>("/register", { 
      method: "POST", 
      body: JSON.stringify(data) 
    });
  },

  login: (email: string, password: string) =>
    req<VendorAuthResponse>("/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  getProfile: () => req<{ data: Vendor }>("/profile"),

  updateProfile: (data: Partial<VendorRegisterInput>) =>
    req<{ data: Vendor }>("/profile", { method: "PUT", body: JSON.stringify(data) }),

  uploadDocument: (file: File, doc_type: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("doc_type", doc_type);
    return req<{ data: VendorDocument }>("/upload-documents", { method: "POST", body: form });
  },

  getStatus: () => req<{ data: VendorStatus }>("/status"),
};

// ── Types ──────────────────────────────────────────────────────────────────
export interface VendorRegisterInput {
  company_name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  price_per_kw: number;
  experience_years: number;
}

export interface Vendor {
  id: number;
  company_name: string;
  email: string;
  phone: string;
  location: string;
  price_per_kw: number;
  experience_years: number;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface VendorAuthResponse {
  success: boolean;
  data: { vendor: Vendor; token: string };
}

export interface VendorDocument {
  id: number;
  vendor_id: number;
  doc_type: "gst" | "pan" | "license" | "photo";
  filename: string;
  original_name: string;
  file_size: number;
  status: "pending" | "verified" | "rejected";
  uploaded_at: string;
}

export interface VendorStatus {
  vendor_id: number;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  documents: VendorDocument[];
  missing_documents: string[];
  verification_progress: string;
}
