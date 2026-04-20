import { motion } from "framer-motion";
import { Star, Crown } from "lucide-react";

const vendors = [
  { name: "Tata Power Solar", rating: 4.8, price: 58000, warranty: 25, install: 7, score: 95, best: true },
  { name: "Adani Solar", rating: 4.6, price: 55000, warranty: 25, install: 10, score: 90 },
  { name: "Vikram Solar", rating: 4.5, price: 52000, warranty: 20, install: 12, score: 86 },
  { name: "Loom Solar", rating: 4.3, price: 50000, warranty: 20, install: 14, score: 80 },
  { name: "Waaree Energies", rating: 4.4, price: 53000, warranty: 22, install: 11, score: 84 },
];

export function Vendors() {
  return (
    <section id="vendors" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-block rounded-full glass px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sky">
            Vendor Comparison
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold">
            Top installers, <span className="text-gradient-solar">side by side</span>
          </h2>
        </motion.div>

        <div className="grid gap-4">
          {vendors.map((v, i) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`glass rounded-2xl p-5 md:p-6 hover-lift relative ${
                v.best ? "ring-2 ring-[var(--solar-glow)]" : ""
              }`}
            >
              {v.best && (
                <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-solar px-3 py-1 text-xs font-bold text-primary-foreground shadow-glow">
                  <Crown className="h-3.5 w-3.5" />
                  Best Choice
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
                <div className="md:col-span-2">
                  <div className="font-bold text-lg">{v.name}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-4 w-4 ${
                          idx < Math.round(v.rating)
                            ? "fill-[var(--solar-glow)] text-[var(--solar-glow)]"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-sm text-muted-foreground">{v.rating}</span>
                  </div>
                </div>
                <Stat label="Per kW" value={`₹${(v.price / 1000).toFixed(0)}k`} />
                <Stat label="Warranty" value={`${v.warranty} yrs`} />
                <Stat label="Install" value={`${v.install} days`} />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Score
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${v.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-gradient-solar rounded-full"
                      />
                    </div>
                    <span className="text-sm font-bold">{v.score}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="font-bold mt-1">{value}</div>
    </div>
  );
}
