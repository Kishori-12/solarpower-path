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
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="inline-block rounded-full glass px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-eco">
            🇮🇳 Government Schemes
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold">
            Subsidies that <span className="text-gradient-solar">save lakhs</span>
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {ALL_STATES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filter === s
                  ? "bg-gradient-solar text-primary-foreground shadow-glow"
                  : "glass hover:scale-105"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((s, i) => (
            <motion.article
              key={s.title}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass rounded-3xl p-6 hover-lift relative overflow-hidden flex flex-col"
            >
              <div
                className="absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-25 blur-2xl"
                style={{ background: s.color }}
              />
              <div className="flex items-start justify-between gap-3 relative">
                <span className="inline-flex items-center gap-1 rounded-full bg-eco/10 px-3 py-1 text-xs font-semibold text-eco">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {s.eligibility}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{s.state}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold leading-snug">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground flex-1">{s.desc}</p>
              <button className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-solar-glow hover:gap-2 transition-all w-fit">
                Learn More <ArrowUpRight className="h-4 w-4" />
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
