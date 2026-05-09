const BASE = "http://127.0.0.1:5000";

function getToken() {
  return localStorage.getItem("sw_token");
}

function normalizeLocation(location: string) {
  const normalized = String(location).toLowerCase();
  if (["north", "south", "central", "east", "west"].includes(normalized)) {
    return normalized;
  }
  return "central";
}

function clearAuthToken() {
  localStorage.removeItem("sw_token");
  localStorage.removeItem("sw_user");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
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
  if (!res.ok) {
    if (res.status === 401) {
      clearAuthToken();
    }
    const errorMessage = json.error || json.msg || json.message || "Request failed";
    throw new Error(errorMessage);
  }
  return json;
}

export const api = {
  // Auth
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Solar
  calculate: (monthly_bill: number, location: string, roof_area: number) =>
    request<CalcResponse>("/calculate", {
      method: "POST",
      body: JSON.stringify({ monthly_bill, location, roof_area }),
    }),

  saveCalculation: (inputs: object, results: object) =>
    request("/save-calculation", {
      method: "POST",
      body: JSON.stringify({ inputs, results }),
    }),

  myCalculations: () => request<{ data: SavedCalc[] }>("/my-calculations"),

  // Vendors
  getVendors: (location?: string) =>
    request(`/get-vendors${location ? `?location=${location}` : ""}`),

  recommendVendors: (location: string, capacity_kw?: number) =>
    request(`/get-vendors/recommend?location=${location}${capacity_kw ? `&capacity_kw=${capacity_kw}` : ""}`),

  // Schemes
  getSchemes: () => request("/get-schemes"),

  // User
  getProfile: () => request<{ data: User }>("/user-data"),

  // AI Recommendations
  recommendVendor: (price_per_kw: number, rating: number, experience_years: number, location: string) =>
    request<VendorRecommendationResponse>("/recommend/vendor", {
      method: "POST",
      body: JSON.stringify({ price_per_kw, rating, experience_years, location }),
    }),

  recommendScheme: (location: string, budget: number, capacity: number) =>
    request<SchemeRecommendationResponse>("/recommend/scheme", {
      method: "POST",
      body: JSON.stringify({ location: normalizeLocation(location), budget, capacity }),
    }),
};

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  data: { user: User; token: string };
}

export interface CalcResponse {
  success: boolean;
  data: {
    inputs: { monthly_bill_inr: number; location: string; roof_area_sqm: number };
    system: { recommended_capacity_kw: number; panels_needed: number; peak_sunlight_hours_per_day: number };
    financials: { installation_cost_inr: number; monthly_savings_inr: number; annual_savings_inr: number; payback_period_years: number; roi_percent: number };
    generation: { daily_generation_units: number; monthly_generation_units: number; annual_generation_units: number };
    environment: { co2_offset_kg_per_year: number; trees_equivalent: number };
    recommended_vendors: Vendor[];
    applicable_schemes: Scheme[];
  };
}

export interface Vendor {
  id: number;
  name: string;
  rating: number;
  price_per_kw_inr: number;
  locations: string[];
  score: number;
  location_matched: boolean;
  estimated_total_cost_inr?: number;
}

export interface Scheme {
  id: number;
  name: string;
  provider: string;
  subsidy_percent: number;
  max_subsidy_inr: number;
  eligibility: string;
  link: string;
}

export interface SavedCalc {
  id: number;
  user_id: number;
  inputs: object;
  results: object;
  saved_at: string;
}

export interface VendorRecommendationResponse {
  success: boolean;
  vendor_score: number;
  recommendation: string;
  confidence: "high" | "medium" | "low";
  vendor: {
    name: string;
    price_per_kw: number;
    rating: number;
  };
  factors: {
    price: string;
    rating: string;
    warranty: string;
  };
}

export interface SchemeRecommendationResponse {
  success: boolean;
  recommended_scheme: string;
  scheme: {
    name: string;
    subsidy: number;
    max_amount: number;
  };
  eligibility: "high" | "medium" | "emerging";
  subsidy_percentage: number;
  estimated_subsidy: number;
  details: string;
  alternatives: string[];
  next_steps: string[];
}
