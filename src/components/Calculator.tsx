import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { MapPin, IndianRupee, Home, Wallet, Zap } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";

const states = [
  { v: "DL", n: "Delhi", sun: 5.2 },
  { v: "MH", n: "Maharashtra", sun: 5.5 },
  { v: "RJ", n: "Rajasthan", sun: 6.0 },
  { v: "GJ", n: "Gujarat", sun: 5.8 },
  { v: "KA", n: "Karnataka", sun: 5.4 },
  { v: "TN", n: "Tamil Nadu", sun: 5.6 },
];

export function Calculator() {
  const [state, setState] = useState("MH");
  const [bill, setBill] = useState(4000);
  const [roof, setRoof] = useState(500);
  const [budget, setBudget] = useState(300000);

  const calc = useMemo(() => {
    const sun = states.find((s) => s.v === state)?.sun ?? 5.5;
    const monthlyUnits = bill / 8; // ₹8/unit avg
    const dailyUnits = monthlyUnits / 30;
    const sizeFromBill = dailyUnits / sun; // kW
    const sizeFromRoof = roof / 100; // 100 sqft per kW
    const sizeFromBudget = budget / 60000; // ₹60k/kW
    const size = Math.max(1, Math.min(sizeFromBill, sizeFromRoof, sizeFromBudget));
    const cost = Math.round(size * 60000);
    const yearlyGen = size * sun * 365;
    const yearlySavings = Math.round(yearlyGen * 8);
    const payback = +(cost / yearlySavings).toFixed(1);
    const data = Array.from({ length: 11 }, (_, i) => ({
      year: i,
      savings: Math.round(yearlySavings * i),
      cost,
    }));
    return { size: +size.toFixed(1), cost, yearlySavings, payback, data };
  }, [state, bill, roof, budget]);

  return (
    <section id="calculator" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-block rounded-full glass px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-solar-glow">
            Solar Calculator
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold">
            Estimate your <span className="text-gradient-solar">solar potential</span>
          </h2>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-2 glass-strong rounded-3xl p-7">
            <div className="space-y-6">
              <Field label="Location" icon={MapPin}>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl bg-input/60 border border-border px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {states.map((s) => (
                    <option key={s.v} value={s.v}>
                      {s.n}
                    </option>
                  ))}
                </select>
              </Field>
              <Slider
                label="Monthly electricity bill"
                icon={IndianRupee}
                value={bill}
                onChange={setBill}
                min={500}
                max={20000}
                step={100}
                fmt={(v) => `₹${v.toLocaleString("en-IN")}`}
              />
              <Slider
                label="Roof size"
                icon={Home}
                value={roof}
                onChange={setRoof}
                min={100}
                max={3000}
                step={50}
                fmt={(v) => `${v} sq ft`}
              />
              <Slider
                label="Budget"
                icon={Wallet}
                value={budget}
                onChange={setBudget}
                min={50000}
                max={1500000}
                step={10000}
                fmt={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
            </div>
          </div>

          {/* Output */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ResultCard label="System Size" value={calc.size} suffix=" kW" decimals={1} />
              <ResultCard label="Total Cost" value={calc.cost} prefix="₹" />
              <ResultCard label="Yearly Savings" value={calc.yearlySavings} prefix="₹" />
              <ResultCard label="Payback" value={calc.payback} suffix=" yrs" decimals={1} />
            </div>

            <div className="glass-strong rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-lg">10-Year ROI Projection</h4>
                  <p className="text-xs text-muted-foreground">Cumulative savings vs initial cost</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-solar shadow-glow">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={calc.data}>
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
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                      }}
                      formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      stroke="oklch(0.72 0.19 55)"
                      strokeWidth={3}
                      fill="url(#sav)"
                    />
                    <Line type="monotone" dataKey="cost" stroke="oklch(0.55 0.15 145)" strokeDasharray="5 5" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold mb-2">
        <Icon className="h-4 w-4 text-solar-glow" />
        {label}
      </label>
      {children}
    </div>
  );
}

function Slider({
  label,
  icon,
  value,
  onChange,
  min,
  max,
  step,
  fmt,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
}) {
  return (
    <Field label={label} icon={icon}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold text-gradient-solar">{fmt(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-[var(--solar-glow)]"
      />
    </Field>
  );
}

function ResultCard({
  label,
  value,
  prefix,
  suffix,
  decimals = 0,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-5 hover-lift"
    >
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
      <div className="mt-2 text-2xl md:text-3xl font-bold text-gradient-solar">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
    </motion.div>
  );
}
