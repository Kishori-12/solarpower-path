const BASE = "http://127.0.0.1:5000";

function getToken() {
  return localStorage.getItem("sw_token");
}

function normalizeLocation(location: string) {
  const normalized = String(location).toLowerCase();
  return ["north", "south", "central", "east", "west"].includes(normalized) ? normalized : "central";
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
    if (res.status === 401) clearAuthToken();
    throw new Error(json.error || json.msg || json.message || "Request failed");
  }
  return json;
}

export const api = {
  // Solar calculator
  calculate: (monthly_bill: number, location: string, roof_area: number) =>
    request<CalcResponse>("/calculate", {
      method: "POST",
      body: JSON.stringify({ monthly_bill, location, roof_area }),
    }),

  // Vendors — fetch all from DB
  getVendors: (location?: string) =>
    request<{ success: boolean; data: VendorResult[] }>(
      `/vendor/list${location ? `?location=${location}` : ""}`
    ),

  // Vendors — AI recommendation by budget + location + capacity
  recommendVendors: (location: string, budget: number, capacity_kw: number) =>
    request<VendorRecommendResponse>(
      `/vendor/recommend?location=${location}&budget=${budget}&capacity_kw=${capacity_kw}&top_n=5`
    ),

  // Schemes — fetch all from DB
  getSchemes: () =>
    request<{ success: boolean; data: Scheme[] }>("/get-schemes"),

  // AI vendor recommendation (used by Calculator)
  recommendVendor: (budget: number, warranty: number, location: string) =>
    request<AiVendorResponse>("/recommend/vendor", {
      method: "POST",
      body: JSON.stringify({ budget, warranty, location }),
    }),

  // AI scheme recommendation
  recommendScheme: (location: string, budget: number, capacity: number) =>
    request<SchemeRecommendationResponse>("/recommend/scheme", {
      method: "POST",
      body: JSON.stringify({ location: normalizeLocation(location), budget, capacity }),
    }),
};

// ── Types ──────────────────────────────────────────────────────────────────

export interface CalcResponse {
  success: boolean;
  data: {
    inputs: { monthly_bill_inr: number; location: string; roof_area_sqm: number };
    system: { recommended_capacity_kw: number; panels_needed: number; peak_sunlight_hours_per_day: number };
    financials: { installation_cost_inr: number; monthly_savings_inr: number; annual_savings_inr: number; payback_period_years: number; roi_percent: number };
    generation: { daily_generation_units: number; monthly_generation_units: number; annual_generation_units: number };
    environment: { co2_offset_kg_per_year: number; trees_equivalent: number };
  };
}

export interface VendorResult {
  id?: string;
  name: string;
  price_per_kw_inr: number;
  rating: number;
  warranty_years: number;
  locations: string[];
  score?: number;
  location_matched?: boolean;
  within_budget?: boolean;
  estimated_total_cost_inr?: number;
  budget_score?: number;
  experience_years?: number;
  status?: string;
}

export interface VendorRecommendResponse {
  success: boolean;
  location: string;
  budget_inr: number;
  capacity_kw: number;
  top_vendors: VendorResult[];
}

export interface AiVendorResponse {
  success: boolean;
  best_vendor: {
    name: string;
    price_per_kw: number;
    rating: number;
    warranty: number;
    location_matched: boolean;
    within_budget: boolean;
    score: number;
  };
  recommendation: string;
  confidence: "high" | "medium" | "low";
  all_vendors: AiVendorResponse["best_vendor"][];
}

export interface Scheme {
  id: string | number;
  name: string;
  provider: string;
  subsidy_percent: number;
  max_subsidy_inr: number;
  eligibility: string;
  link: string;
  active?: boolean;
}

export interface SchemeRecommendationResponse {
  success: boolean;
  recommended_scheme: string;
  scheme: { name: string; subsidy: number; max_amount: number };
  eligibility: "high" | "medium" | "emerging";
  subsidy_percentage: number;
  estimated_subsidy: number;
  details: string;
  alternatives: string[];
  next_steps: string[];
}

export interface SavedCalc {
  id: number;
  inputs: object;
  results: object;
  saved_at: string;
}

// Legacy alias
export type VendorRecommendationResponse = AiVendorResponse;
