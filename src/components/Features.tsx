import { motion } from "framer-motion";
import {
  BarChart3,
  Landmark,
  Building2,
  TrendingUp,
  Leaf,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

type Feat = { icon: LucideIcon; title: string; desc: string; tint: string };

const features: Feat[] = [
  { icon: BarChart3, title: "Solar Savings Calculator", desc: "Estimate generation, cost & monthly savings instantly.", tint: "var(--gradient-solar)" },
  { icon: Landmark, title: "Government Schemes", desc: "Discover PM Surya Ghar, subsidies & state benefits.", tint: "var(--gradient-sky)" },
  { icon: Building2, title: "Vendor Comparison", desc: "Rank top installers by price, rating & warranty.", tint: "var(--gradient-eco)" },
  { icon: TrendingUp, title: "ROI Analysis", desc: "Visualize payback period and 25-year returns.", tint: "var(--gradient-solar)" },
  { icon: Leaf, title: "Carbon Footprint", desc: "Track CO₂ saved and your green impact.", tint: "var(--gradient-eco)" },
  { icon: CreditCard, title: "EMI Calculator", desc: "Plan financing with flexible loan tenures.", tint: "var(--gradient-sky)" },
];

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
          <span className="inline-block rounded-full glass px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-solar-glow">
            Why SolarWise
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold">
            Everything you need to <span className="text-gradient-solar">go solar</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            One intelligent platform for calculations, schemes, vendors, and impact.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group glass rounded-3xl p-7 hover-lift relative overflow-hidden"
            >
              <div
                className="absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"
                style={{ background: f.tint }}
              />
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-glow"
                style={{ background: f.tint }}
              >
                <f.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
