import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Sun, Leaf, Zap, Battery } from "lucide-react";
import heroImg from "@/assets/hero-solar.jpg";

const floats = [
  { Icon: Sun, top: "12%", left: "8%", delay: 0 },
  { Icon: Leaf, top: "70%", left: "5%", delay: 1.2 },
  { Icon: Zap, top: "20%", left: "88%", delay: 0.6 },
  { Icon: Battery, top: "75%", left: "85%", delay: 1.8 },
];

export function Hero() {
  return (
    <section id="top" className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-12">
      {/* Background image + gradient overlay */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Solar panels glowing at sunset"
          className="h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      {/* Floating icons */}
      {floats.map(({ Icon, top, left, delay }, i) => (
        <motion.div
          key={i}
          className="absolute hidden md:flex h-14 w-14 items-center justify-center rounded-2xl glass shadow-glow"
          style={{ top, left }}
          animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
        >
          <Icon className="h-6 w-6 text-primary-foreground" />
        </motion.div>
      ))}

      {/* Sun glow */}
      <div
        className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full blur-3xl opacity-40 animate-glow -z-10"
        style={{ background: "var(--gradient-sun)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 mb-6 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-solar-glow" />
            <span>Smart Solar Decision Engine</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] text-white drop-shadow-lg">
            Switch to Smart Solar with{" "}
            <span className="text-gradient-solar bg-clip-text">SolarWise</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl drop-shadow">
            Calculate your savings, explore government subsidies, and choose the
            best solar solution — all powered by intelligent recommendations.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#calculator"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-solar px-7 py-4 font-semibold text-primary-foreground shadow-glow hover:scale-105 transition-transform"
            >
              Check Your Savings
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#schemes"
              className="inline-flex items-center gap-2 rounded-2xl glass-strong px-7 py-4 font-semibold hover:scale-105 transition-transform"
            >
              Explore Schemes
            </a>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-4 max-w-xl">
            {[
              { v: "2.5M+", l: "kWh Generated" },
              { v: "₹40L+", l: "Saved Yearly" },
              { v: "12K+", l: "Tons CO₂ Cut" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-gradient-solar">
                  {s.v}
                </div>
                <div className="text-xs text-white/80 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
