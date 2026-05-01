import { motion } from "framer-motion";
import { Leaf, TreePine, Cloud, Globe2 } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";

const stats = [
  { icon: Cloud, label: "CO₂ saved / year", value: 4500, suffix: " kg" },
  { icon: TreePine, label: "Equivalent trees", value: 210, suffix: "" },
  { icon: Leaf, label: "Coal avoided", value: 1850, suffix: " kg" },
  { icon: Globe2, label: "Cars off road", value: 1.2, suffix: "", decimals: 1 },
];

export function Carbon() {
  return (
    <section id="carbon" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-eco p-10 md:p-16 shadow-glow">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[var(--solar)]/30 blur-3xl" />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 right-10 hidden md:block"
          >
            <Globe2 className="h-32 w-32 text-white/20" />
          </motion.div>

          <div className="relative max-w-2xl">
            <span className="inline-block rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
              🌱 Carbon Impact
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white">
              You save <AnimatedNumber value={4500} suffix=" kg" /> CO₂ every year
            </h2>
            <p className="mt-4 text-white/85 text-lg">
              By switching to solar, you contribute directly to a cleaner planet — equivalent to planting hundreds of trees.
            </p>
          </div>

          <div className="relative mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-5 text-white"
              >
                <s.icon className="h-6 w-6 mb-3" />
                <div className="text-3xl font-bold">
                  <AnimatedNumber value={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
                </div>
                <div className="text-xs mt-1 text-white/80">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
