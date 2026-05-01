import { motion } from "framer-motion";
import {
  BarChart3,
  Landmark,
  Building2,
  TrendingUp,
  Leaf,
  CreditCard,
  type LucideIcon,
  ArrowUpRight,
} from "lucide-react";

type Feat = { icon: LucideIcon; title: string; desc: string; tint: string; href: string };

const features: Feat[] = [
  { icon: BarChart3, title: "Solar Savings Calculator", desc: "Estimate generation, cost & monthly savings instantly.", tint: "var(--gradient-solar)", href: "#calculator" },
  { icon: Landmark,  title: "Government Schemes",       desc: "Discover PM Surya Ghar, subsidies & state benefits.",  tint: "var(--gradient-sky)",   href: "#schemes" },
  { icon: Building2, title: "Vendor Comparison",        desc: "Rank top installers by price, rating & warranty.",     tint: "var(--gradient-eco)",   href: "#vendors" },
  { icon: TrendingUp,title: "ROI Analysis",             desc: "Visualize payback period and 25-year returns.",        tint: "var(--gradient-solar)", href: "#calculator" },
  { icon: Leaf,      title: "Carbon Footprint",         desc: "Track CO₂ saved and your green impact.",              tint: "var(--gradient-eco)",   href: "#carbon" },
  { icon: CreditCard,title: "EMI Calculator",           desc: "Plan financing with flexible loan tenures.",           tint: "var(--gradient-sky)",   href: "#emi" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block rounded-full glass-premium px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-solar-glow"
          >
            Why SolarWise
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl md:text-5xl font-bold leading-tight"
          >
            Everything you need to <span className="text-gradient-solar">go solar</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            One intelligent platform for calculations, schemes, vendors, and impact.
          </motion.p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              onClick={() => {
                const el = document.querySelector(f.href);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="group glass-premium rounded-3xl p-8 hover-lift relative overflow-hidden cursor-pointer"
            >
              {/* Animated gradient background */}
              <motion.div
                className="absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-0 blur-3xl group-hover:opacity-30 transition-opacity duration-500"
                style={{ background: f.tint }}
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1.1, rotate: 45 }}
                transition={{ duration: 0.6 }}
              />

              {/* Icon container with gradient */}
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-glow relative z-10"
                style={{ background: f.tint }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <f.icon className="h-8 w-8 text-primary-foreground" />
              </motion.div>

              {/* Content */}
              <div className="relative z-10 mt-6">
                <motion.h3
                  className="text-xl font-bold transition-colors"
                  whileHover={{ color: "var(--solar-glow)" }}
                >
                  {f.title}
                </motion.h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>

                {/* Learn more link */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    const el = document.querySelector(f.href);
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-solar-glow hover:gap-2 transition-all opacity-0 group-hover:opacity-100"
                  whileHover={{ x: 4 }}
                >
                  Explore <ArrowUpRight className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Border glow on hover */}
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                initial={{ opacity: 0, boxShadow: "inset 0 0 0 1px transparent" }}
                whileHover={{
                  opacity: 1,
                  boxShadow: `inset 0 0 20px color-mix(in oklab, var(--solar-glow) 30%, transparent)`,
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
