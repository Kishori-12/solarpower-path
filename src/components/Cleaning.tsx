import { motion } from "framer-motion";
import { Star, ShieldCheck, Droplets } from "lucide-react";
import { useState, useEffect } from "react";

interface Cleaner {
  id: string;
  name: string;
  rating: number;
  pricePerVisit: number;
  experience: string;
  verified: boolean;
  score: number;
  best: boolean;
  status?: string;
  mobile?: string;
  address?: string;
}

export function Cleaning() {
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/cleaner/list")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCleaners(data.data);
        }
      })
      .catch((err) => console.error("Error fetching cleaners:", err))
      .finally(() => setLoading(false));
  }, []);
  return (
    <section id="cleaning" className="relative py-24 bg-background">
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
            className="inline-block rounded-full glass-premium px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-solar-glow"
          >
            Maintenance Services
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl md:text-5xl font-bold leading-tight"
          >
            Trusted <span className="text-gradient-solar">Cleaning & Maintenance</span> Experts
          </motion.h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Keep your solar panels at peak efficiency with professional cleaning services.
          </p>
        </motion.div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 glass-premium-dark rounded-3xl">
              <p className="text-muted-foreground text-lg">Loading cleaners...</p>
            </div>
          ) : cleaners.length > 0 ? (
            cleaners.map((c, i) => (
              <motion.div
                key={c.id || c.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ x: 4, y: -2 }}
                className={`glass-premium-dark rounded-3xl p-7 hover-lift relative overflow-hidden group cursor-pointer transition-all ${
                  c.best ? "ring-2 ring-solar-glow shadow-glow scale-105 md:scale-100" : ""
                }`}
              >
                {/* Best choice badge */}
                {c.best && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-gradient-solar px-3 py-1 text-xs font-bold text-primary-foreground shadow-glow mb-4">
                    <Droplets className="h-3 w-3" />
                    Top Rated
                  </div>
                )}

                {/* Background gradient */}
                <motion.div
                  className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 blur-3xl group-hover:opacity-20 transition-opacity"
                  style={{
                    background: c.best ? "var(--gradient-solar)" : "var(--gradient-sky)",
                  }}
                />

                <div className="grid grid-cols-2 md:grid-cols-7 gap-4 items-center relative z-10">
                  {/* Info */}
                  <div className="md:col-span-2">
                    <motion.div
                      whileHover={{ color: "var(--solar-glow)" }}
                      className="font-bold text-lg transition-colors flex items-center gap-2"
                    >
                      {c.name}
                      <div
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          c.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : c.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : c.status === "under_review"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {(c.status || "pending").replace("_", " ")}
                      </div>
                      {c.verified && (
                        <span title="Verified Professional">
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                        </span>
                      )}
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
                              idx < Math.round(c.rating || 0)
                                ? "fill-solar-glow text-solar-glow"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </motion.div>
                      ))}
                      <span className="ml-2 text-sm font-semibold text-muted-foreground">
                        {c.rating || 0}
                      </span>
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground space-y-2">
                      <div>
                        <span className="font-semibold text-primary">Phone:</span> {c.mobile || "N/A"}
                      </div>
                      <div>
                        <span className="font-semibold text-primary">Address:</span> {c.address || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <Stat label="Per Visit" value={`₹${c.pricePerVisit || 0}`} />
                  <Stat label="Experience" value={c.experience || "N/A"} />
                  <Stat label="Verified" value={c.verified ? "Yes" : "No"} />

                  {/* Score bar */}
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                      Service Score
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2.5 rounded-full bg-muted/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${c.score || 0}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                          className="h-full bg-gradient-solar rounded-full"
                        />
                      </div>
                      <motion.span
                        key={c.score}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-sm font-bold min-w-[2rem] text-right"
                      >
                        {c.score || 0}
                      </motion.span>
                    </div>
                  </div>

                  {/* CTA button */}
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg bg-gradient-solar text-primary-foreground text-sm font-semibold shadow-glow hover:shadow-xl transition-all whitespace-nowrap"
                    >
                      Book Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 glass-premium-dark rounded-3xl">
              <p className="text-muted-foreground text-lg">No cleaning personnel found.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
      <div className="font-bold mt-1 text-primary">{value}</div>
    </motion.div>
  );
}
