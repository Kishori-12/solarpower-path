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
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block rounded-full glass-premium px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sky"
          >
            Vendor Comparison
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl md:text-5xl font-bold leading-tight"
          >
            Top installers, <span className="text-gradient-solar">side by side</span>
          </motion.h2>
        </motion.div>

        <div className="space-y-4">
          {vendors.map((v, i) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ x: 4, y: -2 }}
              className={`glass-premium-dark rounded-3xl p-7 hover-lift relative overflow-hidden group cursor-pointer transition-all ${
                v.best ? "ring-2 ring-solar-glow shadow-glow scale-105 md:scale-100" : ""
              }`}
            >
              {/* Best choice badge - animated */}
              {v.best && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-4 left-8 inline-flex items-center gap-2 rounded-full bg-gradient-solar px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow"
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity }}>
                    <Crown className="h-4 w-4" />
                  </motion.div>
                  Best Choice
                </motion.div>
              )}

              {/* Background gradient */}
              <motion.div
                className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 blur-3xl group-hover:opacity-20 transition-opacity"
                style={{
                  background: v.best ? "var(--gradient-solar)" : "var(--gradient-sky)",
                }}
              />

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center relative z-10">
                {/* Vendor info */}
                <div className="md:col-span-2">
                  <motion.div
                    whileHover={{ color: "var(--solar-glow)" }}
                    className="font-bold text-lg transition-colors"
                  >
                    {v.name}
                  </motion.div>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`h-4 w-4 transition-colors ${
                            idx < Math.round(v.rating)
                              ? "fill-solar-glow text-solar-glow"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </motion.div>
                    ))}
                    <span className="ml-2 text-sm font-semibold text-muted-foreground">{v.rating}</span>
                  </div>
                </div>

                {/* Stats */}
                <Stat label="Per kW" value={`₹${(v.price / 1000).toFixed(0)}k`} />
                <Stat label="Warranty" value={`${v.warranty} yrs`} />
                <Stat label="Install" value={`${v.install} days`} />

                {/* Score bar */}
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                    Score
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2.5 rounded-full bg-muted/60 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${v.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                        className="h-full bg-gradient-solar rounded-full"
                      />
                    </div>
                    <motion.span
                      key={v.score}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="text-sm font-bold min-w-[2rem] text-right"
                    >
                      {v.score}
                    </motion.span>
                  </div>
                </div>
              </div>

              {/* CTA button on hover */}
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 px-4 py-2 rounded-lg bg-solar-glow text-primary-foreground text-sm font-semibold hover:shadow-glow transition-all"
              >
                Select
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="font-bold mt-1 text-primary">{value}</div>
    </motion.div>
  );
}
