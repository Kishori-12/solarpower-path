import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line,
} from "recharts";
import { MapPin, IndianRupee, Home, Wallet, Zap, Save, Loader2, CheckCircle } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { api } from "@/lib/api";
import { useAuth } from "@/store/authStore";
import { AuthModal } from "@/components/AuthModal";
import type { VendorRecommendationResponse, SchemeRecommendationResponse } from "@/lib/api";

const states = [
  { v: "north",   n: "North India (Delhi/UP/Punjab)",    sun: 4.5 },
  { v: "south",   n: "South India (TN/Kerala/Karnataka)", sun: 5.5 },
  { v: "east",    n: "East India (WB/Odisha)",            sun: 4.8 },
  { v: "west",    n: "West India (Rajasthan/Gujarat)",    sun: 5.8 },
  { v: "central", n: "Central India (MP/Maharashtra)",   sun: 5.2 },
];

interface CalcResult {
  system: { recommended_capacity_kw: number; panels_needed: number };
  financials: { installation_cost_inr: number; monthly_savings_inr: number; annual_savings_inr: number; payback_period_years: number; roi_percent: number };
  generation: { daily_generation_units: number; annual_generation_units: number };
  environment: { co2_offset_kg_per_year: number; trees_equivalent: number };
  inputs: { monthly_bill_inr: number; location: string; roof_area_sqm: number };
}

export function Calculator() {
  const { isLoggedIn } = useAuth();
  const [location, setLocation] = useState("south");
  const [bill, setBill] = useState(4000);
  const [roof, setRoof] = useState(500);
  const [budget, setBudget] = useState(300000);

  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [vendorRec, setVendorRec] = useState<VendorRecommendationResponse | null>(null);
  const [schemeRec, setSchemeRec] = useState<SchemeRecommendationResponse | null>(null);

  // Local estimate for chart (instant feedback)
  const sun = states.find((s) => s.v === location)?.sun ?? 5.0;
  const localSize = Math.max(1, Math.min(bill / 8 / 30 / sun, roof / 100, budget / 60000));
  const localCost = Math.round(localSize * 60000);
  const localYearlySavings = Math.round(localSize * sun * 365 * 8);
  const chartData = Array.from({ length: 11 }, (_, i) => ({
    year: i,
    savings: Math.round(localYearlySavings * i),
    cost: localCost,
  }));

  const handleCalculate = async () => {
    setError("");
    setLoading(true);
    setSaved(false);
    setVendorRec(null);
    setSchemeRec(null);
    try {
      const res = await api.calculate(bill, location, roof / 10.764); // sqft → sqm
      setResult(res.data);

      // Call AI recommendations in parallel
      const fin = res.data.financials;
      const sys = res.data.system;
      
      try {
        // Estimate vendor price as average cost per kW
        const vendorPrice = Math.round(fin.installation_cost_inr / sys.recommended_capacity_kw);
        const vendorRating = 4.5; // Default rating for demo
        const warranty = 10; // Default warranty for demo
        
        const vendorRes = await api.recommendVendor(vendorPrice, vendorRating, warranty, location);
        setVendorRec(vendorRes);
      } catch (e) {
        console.warn("Vendor recommendation failed:", e);
        setVendorRec({
          success: false,
          vendor_score: 0,
          recommendation: "No approved vendor is available for your selected location right now.",
          confidence: "low",
          vendor: { name: "No vendor available", price_per_kw: 0, rating: 0 },
          factors: { price: "N/A", rating: "N/A", warranty: "N/A" }
        });
      }

      try {
        const capacity = sys.recommended_capacity_kw > 0 ? sys.recommended_capacity_kw : 0.5;
        const schemeRes = await api.recommendScheme(location, budget, capacity);
        setSchemeRec(schemeRes);
      } catch (e) {
        console.warn("Scheme recommendation failed:", e);
        setSchemeRec({
          success: false,
          recommended_scheme: "No scheme available",
          scheme: { name: "No scheme available", subsidy: 0, max_amount: 0 },
          eligibility: "emerging",
          subsidy_percentage: 0,
          estimated_subsidy: 0,
          details: "Scheme recommendation could not be fetched at this time.",
          alternatives: [],
          next_steps: []
        });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn) { setAuthOpen(true); return; }
    if (!result) return;
    setSaving(true);
    try {
      await api.saveCalculation(result.inputs, result);
      setSaved(true);
    } catch {
      setError("Failed to save calculation");
    } finally {
      setSaving(false);
    }
  };

  const fin = result?.financials;
  const sys = result?.system;

  return (
    <>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <section id="calculator" className="relative py-24">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="inline-block rounded-full glass-premium px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-solar-glow">
              Solar Calculator
            </span>
            <h2 className="mt-6 text-4xl md:text-5xl font-bold leading-tight">
              Estimate your <span className="text-gradient-solar">solar potential</span>
            </h2>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 glass-premium rounded-3xl p-8"
            >
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="font-bold text-lg">Enter Your Details</h3>
                  <p className="text-sm text-muted-foreground mt-1">Get accurate solar recommendations</p>
                </div>

                <Field label="Location" icon={MapPin}>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-solar transition-all hover:border-solar/50"
                  >
                    {states.map((s) => (
                      <option key={s.v} value={s.v}>{s.n}</option>
                    ))}
                  </select>
                </Field>

                <Slider label="Monthly electricity bill" icon={IndianRupee} value={bill} onChange={setBill} min={500} max={20000} step={100} fmt={(v) => `₹${v.toLocaleString("en-IN")}`} />
                <Slider label="Roof size" icon={Home} value={roof} onChange={setRoof} min={100} max={3000} step={50} fmt={(v) => `${v} sq ft`} />
                <Slider label="Budget" icon={Wallet} value={budget} onChange={setBudget} min={50000} max={1500000} step={10000} fmt={(v) => `₹${(v / 1000).toFixed(0)}k`} />

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCalculate}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-solar text-primary-foreground font-semibold shadow-glow hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  {loading ? "Calculating..." : "Calculate Now"}
                </motion.button>

                {result && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving || saved}
                    className="w-full py-3 rounded-xl glass-premium font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saved ? <CheckCircle className="h-4 w-4 text-green-400" /> : saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saved ? "Saved!" : saving ? "Saving..." : isLoggedIn ? "Save Calculation" : "Sign In to Save"}
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Output */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3 space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ResultCard label="System Size" value={sys?.recommended_capacity_kw ?? localSize} suffix=" kW" decimals={1} tint="var(--gradient-solar)" />
                <ResultCard label="Total Cost" value={fin?.installation_cost_inr ?? localCost} prefix="₹" tint="var(--gradient-sky)" />
                <ResultCard label="Yearly Savings" value={fin?.annual_savings_inr ?? localYearlySavings} prefix="₹" tint="var(--gradient-eco)" />
                <ResultCard label="Payback" value={fin?.payback_period_years ?? +(localCost / localYearlySavings).toFixed(1)} suffix=" yrs" decimals={1} tint="var(--gradient-solar)" />
              </div>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="glass-premium rounded-2xl p-4 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Panels</div>
                    <div className="text-xl font-bold text-gradient-solar">{sys?.panels_needed}</div>
                  </div>
                  <div className="glass-premium rounded-2xl p-4 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ROI</div>
                    <div className="text-xl font-bold text-gradient-solar">{fin?.roi_percent}%</div>
                  </div>
                  <div className="glass-premium rounded-2xl p-4 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">CO₂ Saved</div>
                    <div className="text-xl font-bold text-gradient-solar">{result.environment.co2_offset_kg_per_year} kg/yr</div>
                  </div>
                </motion.div>
              )}

              {/* AI Recommendations Section */}
              {result && (vendorRec || schemeRec) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-4 mt-4"
                >
                  {vendorRec && (
                    <div className="glass-premium rounded-2xl p-4 border-l-4 border-solar">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">🏭 Best Vendor Match</div>
                      <div className="text-lg font-bold text-gradient-solar mb-1">
                        {vendorRec.vendor?.name ?? "No vendor available"}
                      </div>

                      {vendorRec.vendor?.name === "No vendor available" ? (
                        <p className="text-sm text-muted-foreground break-words">{vendorRec.recommendation}</p>
                      ) : (
                        <>
                          <div className="text-sm font-semibold mb-2">{vendorRec.vendor_score.toFixed(1)}/100</div>
                          <p className="text-xs text-muted-foreground mb-1">₹{vendorRec.vendor?.price_per_kw?.toLocaleString("en-IN")}/kW · Rating: {vendorRec.vendor?.rating}/5</p>
                          <p className="text-sm text-muted-foreground break-words">{vendorRec.recommendation}</p>
                          <div className="mt-3 text-xs bg-solar/10 rounded px-2 py-1 text-solar font-medium">Confidence: {vendorRec.confidence}</div>
                        </>
                      )}
                    </div>
                  )}

                  {schemeRec && (
                    <div className="glass-premium rounded-2xl p-4 border-l-4 border-green-500">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">💰 Scheme Recommendation</div>
                      <div className="text-lg font-bold text-green-500 mb-2">{schemeRec.scheme?.name ?? schemeRec.recommended_scheme ?? "No scheme available"}</div>
                      <p className="text-sm text-muted-foreground mb-1">Subsidy: ₹{(schemeRec.scheme?.subsidy ?? schemeRec.estimated_subsidy).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground mb-2">Max: ₹{schemeRec.scheme?.max_amount?.toLocaleString("en-IN")}</p>
                      <div className="text-xs bg-green-500/10 rounded px-2 py-1 text-green-600 font-medium">Eligibility: {schemeRec.eligibility}</div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ROI Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="glass-premium-dark rounded-3xl p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-bold text-lg">10-Year ROI Projection</h4>
                    <p className="text-sm text-muted-foreground mt-1">Cumulative savings over time</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-solar shadow-glow">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="sav" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.78 0.18 60)" stopOpacity={0.7} />
                          <stop offset="100%" stopColor="oklch(0.78 0.18 60)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.7 0.02 80 / 0.2)" />
                      <XAxis dataKey="year" stroke="currentColor" fontSize={12} />
                      <YAxis stroke="currentColor" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}
                        formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
                      />
                      <Area type="monotone" dataKey="savings" stroke="oklch(0.72 0.19 55)" strokeWidth={3} fill="url(#sav)" />
                      <Line type="monotone" dataKey="cost" stroke="oklch(0.55 0.15 145)" strokeDasharray="5 5" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold mb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-solar/10">
          <Icon className="h-4 w-4 text-solar-glow" />
        </div>
        {label}
      </label>
      {children}
    </div>
  );
}

function Slider({ label, icon, value, onChange, min, max, step, fmt }: {
  label: string; icon: React.ComponentType<{ className?: string }>; value: number;
  onChange: (v: number) => void; min: number; max: number; step: number; fmt: (v: number) => string;
}) {
  return (
    <Field label={label} icon={icon}>
      <div className="flex items-center justify-between mb-3">
        <motion.span key={value} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-2xl font-bold text-gradient-solar">
          {fmt(value)}
        </motion.span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)}
        className="w-full h-2 bg-gradient-to-r from-solar/20 to-solar-glow/20 rounded-lg appearance-none cursor-pointer slider-thumb transition-all"
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>{fmt(min)}</span><span>{fmt(max)}</span>
      </div>
    </Field>
  );
}

function ResultCard({ label, value, prefix, suffix, decimals = 0, tint = "var(--gradient-solar)" }: {
  label: string; value: number; prefix?: string; suffix?: string; decimals?: number; tint?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      viewport={{ once: true }}
      className="glass-premium rounded-2xl p-6 hover-lift relative overflow-hidden group cursor-pointer"
    >
      <motion.div className="absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-0 blur-2xl group-hover:opacity-40 transition-opacity" style={{ background: tint }} />
      <div className="relative z-10">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">{label}</div>
        <div className="text-2xl md:text-3xl font-bold text-gradient-solar">
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </div>
      </div>
    </motion.div>
  );
}
