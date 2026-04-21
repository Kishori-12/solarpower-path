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
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block rounded-full glass-premium px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sky"
          >
            EMI Calculator
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl md:text-5xl font-bold leading-tight"
          >
            Plan your <span className="text-gradient-solar">solar financing</span>
          </motion.h2>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-premium rounded-3xl p-8 space-y-6"
          >
            <div className="mb-6">
              <h3 className="font-bold text-lg">Loan Parameters</h3>
              <p className="text-sm text-muted-foreground mt-1">Customize your EMI plan</p>
            </div>

            <SliderField
              label="Loan amount"
              icon={Wallet}
              value={amount}
              onChange={setAmount}
              min={50000}
              max={1500000}
              step={10000}
              fmt={(v) => `₹${v.toLocaleString("en-IN")}`}
            />
            <SliderField
              label="Interest rate"
              icon={Percent}
              value={rate}
              onChange={setRate}
              min={6}
              max={18}
              step={0.1}
              fmt={(v) => `${v.toFixed(1)}%`}
            />
            <SliderField
              label="Tenure"
              icon={CalendarDays}
              value={tenure}
              onChange={setTenure}
              min={1}
              max={15}
              step={1}
              fmt={(v) => `${v} ${v === 1 ? "year" : "years"}`}
            />
          </motion.div>

          {/* Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {/* Main EMI card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl bg-gradient-solar p-10 shadow-glow text-primary-foreground relative overflow-hidden group hover-lift"
            >
              <motion.div
                className="absolute -top-8 -right-8 h-32 w-32 opacity-20 rounded-full"
                style={{ background: "rgba(255, 255, 255, 0.3)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, linear: true }}
              />
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative z-10"
              >
                <div className="text-sm font-semibold uppercase tracking-wider opacity-85 mb-2">
                  Monthly EMI
                </div>
                <div className="text-5xl md:text-6xl font-bold flex items-baseline gap-1">
                  <span>₹</span>
                  <AnimatedNumber value={emi} decimals={0} />
                </div>
                <div className="mt-3 opacity-85 text-sm font-medium">
                  for {tenure} {tenure === 1 ? "year" : "years"} ({tenure * 12} months)
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 rounded-full bg-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </motion.div>

            {/* Secondary cards */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -4 }}
                className="glass-premium rounded-2xl p-6 hover-lift"
              >
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Total Interest
                </div>
                <div className="text-3xl font-bold text-gradient-solar">
                  <AnimatedNumber value={interest} prefix="₹" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">over {tenure * 12} months</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -4 }}
                className="glass-premium rounded-2xl p-6 hover-lift"
              >
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Total Payable
                </div>
                <div className="text-3xl font-bold text-gradient-solar">
                  <AnimatedNumber value={total} prefix="₹" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">principal + interest</p>
              </motion.div>
            </div>

            {/* Savings insight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="glass-premium-dark rounded-2xl p-5 border border-eco/30"
            >
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-eco">💡 Tip:</span> Solar systems pay for themselves in {Math.ceil(amount / 50000)} years of savings. Consider a shorter EMI tenure for better returns!
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SliderField({
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <label className="flex items-center gap-2 text-sm font-semibold mb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky/10">
          <Icon className="h-4 w-4 text-sky" />
        </div>
        {label}
      </label>
      <div className="flex items-center justify-between mb-3">
        <motion.span
          key={value}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold text-gradient-solar"
        >
          {fmt(value)}
        </motion.span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          className="w-full h-2 bg-gradient-to-r from-sky/20 to-sky/40 rounded-lg appearance-none cursor-pointer slider-thumb"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
    </motion.div>
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
