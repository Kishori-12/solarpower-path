import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck } from "lucide-react";

const ALL_STATES = ["All", "Pan-India", "Maharashtra", "Gujarat", "Delhi", "Rajasthan"];

const schemes = [
  {
    title: "PM Surya Ghar Muft Bijli Yojana",
    state: "Pan-India",
    desc: "Up to ₹78,000 subsidy for rooftop solar installation. Get up to 300 free units monthly.",
    eligibility: "Residential",
    color: "var(--gradient-solar)",
  },
  {
    title: "Rooftop Solar Programme Phase II",
    state: "Pan-India",
    desc: "MNRE central financial assistance for residential rooftop solar up to 10 kW capacity.",
    eligibility: "Residential",
    color: "var(--gradient-sky)",
  },
  {
    title: "Maharashtra Mukhyamantri Solar Yojana",
    state: "Maharashtra",
    desc: "State subsidy for agricultural pumps and rooftop installations across Maharashtra.",
    eligibility: "Farmers",
    color: "var(--gradient-eco)",
  },
  {
    title: "Surya Gujarat Yojana",
    state: "Gujarat",
    desc: "40% subsidy on systems up to 3 kW; 20% on 3–10 kW for residential users.",
    eligibility: "Residential",
    color: "var(--gradient-solar)",
  },
  {
    title: "Delhi Solar Policy 2024",
    state: "Delhi",
    desc: "Generation-based incentives plus net-metering for fast urban adoption.",
    eligibility: "Residential & Commercial",
    color: "var(--gradient-sky)",
  },
  {
    title: "Rajasthan Solar Energy Policy",
    state: "Rajasthan",
    desc: "Wheeling charge waivers and land allotment for utility-scale solar projects.",
    eligibility: "Commercial",
    color: "var(--gradient-eco)",
  },
];

export function Schemes() {
  const [filter, setFilter] = useState("All");
  const visible =
    filter === "All" ? schemes : schemes.filter((s) => s.state === filter);

  return (
    <section id="schemes" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block rounded-full glass-premium px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-eco"
          >
            🇮🇳 Government Schemes
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl md:text-5xl font-bold leading-tight"
          >
            Subsidies that <span className="text-gradient-solar">save lakhs</span>
          </motion.h2>
        </motion.div>

        {/* Enhanced filter buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12 p-4 glass-premium rounded-2xl w-fit mx-auto"
        >
          {ALL_STATES.map((s) => (
            <motion.button
              key={s}
              onClick={() => setFilter(s)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                filter === s
                  ? "bg-gradient-solar text-primary-foreground shadow-glow scale-105"
                  : "glass-premium-dark hover:border-solar/50 text-foreground/80 hover:text-foreground"
              }`}
            >
              {s}
            </motion.button>
          ))}
        </motion.div>

        {/* Scheme cards with layout animation */}
        <motion.div
          layout
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((s, i) => (
            <motion.article
              key={s.title}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass-premium rounded-3xl p-7 hover-lift relative overflow-hidden group cursor-pointer"
            >
              {/* Animated background gradient */}
              <motion.div
                className="absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-0 blur-3xl group-hover:opacity-40 transition-opacity"
                style={{ background: s.color }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, linear: true }}
              />

              <div className="relative z-10">
                {/* Header with badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-eco/15 px-3 py-1.5 text-xs font-semibold text-eco"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    {s.eligibility}
                  </motion.span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-border/50 text-xs text-muted-foreground font-medium">
                    {s.state}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold leading-snug group-hover:text-solar-glow transition-colors">
                  {s.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
                  {s.desc}
                </p>

                {/* Learn more button */}
                <motion.button
                  whileHover={{ x: 4 }}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-solar-glow hover:gap-2 transition-all group-hover:scale-105"
                >
                  Learn More <ArrowUpRight className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Border glow */}
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  boxShadow: `inset 0 0 20px color-mix(in oklab, ${s.color.split('(')[1]} 20%, transparent)`,
                }}
              />
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
