import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Percent, CalendarDays, Wallet } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";

export function EMI() {
  const [amount, setAmount] = useState(300000);
  const [rate, setRate] = useState(9);
  const [tenure, setTenure] = useState(5);

  const { emi, total, interest } = useMemo(() => {
    const r = rate / 12 / 100;
    const n = tenure * 12;
    const e = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const t = e * n;
    return { emi: Math.round(e), total: Math.round(t), interest: Math.round(t - amount) };
  }, [amount, rate, tenure]);

  return (
    <section id="emi" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-block rounded-full glass px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sky">
            EMI Calculator
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold">
            Plan your <span className="text-gradient-solar">solar financing</span>
          </h2>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="glass-strong rounded-3xl p-7 space-y-6">
            <Slider
              label="Loan amount"
              icon={Wallet}
              value={amount}
              onChange={setAmount}
              min={50000}
              max={1500000}
              step={10000}
              fmt={(v) => `₹${v.toLocaleString("en-IN")}`}
            />
            <Slider
              label="Interest rate"
              icon={Percent}
              value={rate}
              onChange={setRate}
              min={6}
              max={18}
              step={0.1}
              fmt={(v) => `${v.toFixed(1)}%`}
            />
            <Slider
              label="Tenure"
              icon={CalendarDays}
              value={tenure}
              onChange={setTenure}
              min={1}
              max={15}
              step={1}
              fmt={(v) => `${v} ${v === 1 ? "year" : "years"}`}
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-gradient-solar p-8 shadow-glow text-primary-foreground relative overflow-hidden">
              <CreditCard className="absolute -top-4 -right-4 h-32 w-32 opacity-20" />
              <div className="text-sm font-semibold uppercase tracking-wider opacity-80">
                Monthly EMI
              </div>
              <div className="mt-2 text-5xl md:text-6xl font-bold">
                <AnimatedNumber value={emi} prefix="₹" />
              </div>
              <div className="mt-2 opacity-80 text-sm">per month for {tenure} years</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Total Interest
                </div>
                <div className="mt-2 text-2xl font-bold text-gradient-solar">
                  <AnimatedNumber value={interest} prefix="₹" />
                </div>
              </div>
              <div className="glass rounded-2xl p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Total Payable
                </div>
                <div className="mt-2 text-2xl font-bold text-gradient-solar">
                  <AnimatedNumber value={total} prefix="₹" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  icon: Icon,
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
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold mb-2">
        <Icon className="h-4 w-4 text-solar-glow" />
        {label}
      </label>
      <div className="text-2xl font-bold text-gradient-solar mb-2">{fmt(value)}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-[var(--solar-glow)]"
      />
    </div>
  );
}
