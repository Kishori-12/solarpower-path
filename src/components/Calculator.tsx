import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Line,
} from "recharts";
import {
  MapPin, IndianRupee, Home, Wallet, Zap,
  Loader2, Star, CheckCircle, ExternalLink, Building2, FileText,
} from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { api, VendorResult, Scheme } from "@/lib/api";

const states = [
  { v: "north",   n: "North India (Delhi/UP/Punjab)",     sun: 4.5 },
  { v: "south",   n: "South India (TN/Kerala/Karnataka)", sun: 5.5 },
  { v: "east",    n: "East India (WB/Odisha)",             sun: 4.8 },
  { v: "west",    n: "West India (Rajasthan/Gujarat)",     sun: 5.8 },
  { v: "central", n: "Central India (MP/Maharashtra)",    sun: 5.2 },
];

interface CalcResult {
  system: { recommended_capacity_kw: number; panels_needed: number };
  financials: {
    installation_cost_inr: number;
    monthly_savings_inr: number;
    annual_savings_inr: number;
    payback_period_years: number;
    roi_percent: number;
  };
  generation: { daily_generation_units: number; annual_generation_units: number };
  environment: { co2_offset_kg_per_year: number; trees_equivalent: number };
  inputs: { monthly_bill_inr: number; location: string; roof_area_sqm: number };
}

export function Calculator() {
  const [location, setLocation] = useState("south");
  const [bill, setBill]         = useState(4000);
  const [roof, setRoof]         = useState(500);
  const [budget, setBudget]     = useState(300000);

  const [result, setResult]   = useState<CalcResult | null>(null);
  const [vendors, setVendors] = useState<VendorResult[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const sun             = states.find((s) => s.v === location)?.sun ?? 5.0;
  const localSize       = Math.max(1, Math.min(bill / 8 / 30 / sun, roof / 100, budget / 60000));
  const localCost       = Math.round(localSize * 60000);
  const localYearlySavings = Math.round(localSize * sun * 365 * 8);
  const estimatedPayback   = localYearlySavings > 0 ? +(localCost / localYearlySavings).toFixed(1) : 0;

  const chartData = Array.from({ length: 11 }, (_, i) => ({
    year: i,
    savings: Math.round(localYearlySavings * i),
    cost: localCost,
  }));

  const handleCalculate = async () => {
    setError(""); setLoading(true);
    setVendors([]); setSchemes([]);
    try {
      const res = await api.calculate(bill, location, roof / 10.764);
      setResult(res.data);

      const capacity = res.data.system.recommended_capacity_kw || 3;

      // Vendor recommendations (budget + location aware)
      try {
        const vRes = await api.recommendVendors(location, budget, capacity);
        setVendors(vRes.top_vendors ?? []);
      } catch (e) {
        console.warn("Vendor recommendation failed:", e);
      }

      // Government schemes from DB
      try {
        const sRes = await api.getSchemes();
        setSchemes(sRes.data ?? []);
      } catch (e) {
        console.warn("Schemes fetch failed:", e);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const fin = result?.financials;
  const sys = result?.system;

  return (
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
              <div>
                <h3 className="font-bold text-lg">Enter Your Details</h3>
                <p className="text-sm text-muted-foreground mt-1">Get accurate solar recommendations</p>
              </div>

              <Field label="Location" icon={MapPin}>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-solar transition-all hover:border-solar/50"
                >
                  {states.map((s) => <option key={s.v} value={s.v}>{s.n}</option>)}
                </select>
              </Field>

              <Slider label="Monthly electricity bill" icon={IndianRupee} value={bill}   onChange={setBill}   min={500}   max={20000}   step={100}   fmt={(v) => `₹${v.toLocaleString("en-IN")}`} />
              <Slider label="Roof size"                icon={Home}        value={roof}   onChange={setRoof}   min={100}   max={3000}    step={50}    fmt={(v) => `${v} sq ft`} />
              <Slider label="Budget"                   icon={Wallet}      value={budget} onChange={setBudget} min={50000} max={1500000} step={10000} fmt={(v) => `₹${(v / 1000).toFixed(0)}k`} />

              {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

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
            </div>
          </motion.div>

          {/* Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 space-y-6"
          >
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ResultCard label="System Size"    value={sys?.recommended_capacity_kw ?? localSize}        suffix=" kW"  decimals={1} tint="var(--gradient-solar)" />
              <ResultCard label="Total Cost"     value={fin?.installation_cost_inr   ?? localCost}        prefix="₹"                tint="var(--gradient-sky)"   />
              <ResultCard label="Yearly Savings" value={fin?.annual_savings_inr      ?? localYearlySavings} prefix="₹"              tint="var(--gradient-eco)"   />
              <ResultCard label="Payback"        value={fin?.payback_period_years    ?? estimatedPayback} suffix=" yrs" decimals={1} tint="var(--gradient-solar)" />
            </div>

            {/* Extra stats */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-4">
                {[
                  { label: "Panels",    value: `${sys?.panels_needed}` },
                  { label: "ROI",       value: `${fin?.roi_percent}%` },
                  { label: "CO₂ Saved", value: `${result.environment.co2_offset_kg_per_year} kg/yr` },
                ].map(({ label, value }) => (
                  <div key={label} className="glass-premium rounded-2xl p-4 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
                    <div className="text-xl font-bold text-gradient-solar">{value}</div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Vendor Recommendations */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-premium-dark rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-solar-glow" />
                  <h4 className="font-bold text-lg">Best Vendors for Your Budget</h4>
                  <span className="ml-auto text-xs text-muted-foreground">Budget: ₹{budget.toLocaleString("en-IN")}</span>
                </div>

                {vendors.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading vendor recommendations...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vendors.map((v, i) => (
                      <motion.div
                        key={v.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                          i === 0 ? "glass-premium ring-1 ring-solar-glow/40" : "glass-premium"
                        }`}
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          i === 0 ? "bg-gradient-solar text-primary-foreground shadow-glow" : "bg-muted/60 text-muted-foreground"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm truncate">{v.name}</span>
                            {i === 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-solar/20 text-solar-glow font-semibold">Best Match</span>}
                            {v.within_budget && <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/15 text-green-400 font-semibold">Within Budget</span>}
                            {v.location_matched && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-400/15 text-blue-400 font-semibold">Local</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>₹{v.price_per_kw_inr?.toLocaleString("en-IN")}/kW</span>
                            <span>Total: ₹{v.estimated_total_cost_inr?.toLocaleString("en-IN")}</span>
                            {v.warranty_years > 0 && <span>{v.warranty_years}yr warranty</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="h-3.5 w-3.5 fill-solar-glow text-solar-glow" />
                          <span className="text-sm font-bold">{v.rating}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Scheme Recommendations */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-premium-dark rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-green-400" />
                  <h4 className="font-bold text-lg">Applicable Government Schemes</h4>
                </div>

                {schemes.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading schemes...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {schemes.map((s, i) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-4 p-4 rounded-2xl glass-premium"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-400/15 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{s.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{s.provider}</div>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/15 text-green-400 font-semibold">
                              {s.subsidy_percent}% subsidy
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Up to ₹{s.max_subsidy_inr?.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-muted-foreground">{s.eligibility}</span>
                          </div>
                        </div>
                        {s.link && (
                          <a href={s.link} target="_blank" rel="noopener noreferrer"
                            className="shrink-0 p-1.5 rounded-lg glass-premium hover:shadow-glow transition-all text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ROI Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
                        <stop offset="0%"   stopColor="oklch(0.78 0.18 60)" stopOpacity={0.7} />
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
                    <Line  type="monotone" dataKey="cost"    stroke="oklch(0.55 0.15 145)" strokeDasharray="5 5" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, icon: Icon, children }: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
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
  label: string; icon: React.ComponentType<{ className?: string }>;
  value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; fmt: (v: number) => string;
}) {
  return (
    <Field label={label} icon={icon}>
      <div className="mb-3">
        <motion.span key={value} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold text-gradient-solar"
        >
          {fmt(value)}
        </motion.span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
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
      className="glass-premium rounded-2xl p-6 relative overflow-hidden group cursor-pointer"
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
