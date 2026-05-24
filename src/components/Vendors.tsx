import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Crown, Loader2 } from "lucide-react";
import { api, VendorResult } from "@/lib/api";

const LOCATIONS = ["north", "south", "east", "west", "central"];

export function Vendors() {
  const [budget, setBudget]             = useState("150000");
  const [location, setLocation]         = useState("central");
  const [vendors, setVendors]           = useState<VendorResult[]>([]);
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [searched, setSearched]         = useState(false);

  useEffect(() => { handleRecommend(); }, []);

  async function handleRecommend() {
    setError("");
    setLoading(true);
    try {
      const res = await api.recommendVendors(location, parseFloat(budget) || 150000, 3);
      if (res.success && res.top_vendors?.length) {
        setVendors(res.top_vendors);
        setRecommendation(
          `Showing top vendors for ${location.charAt(0).toUpperCase() + location.slice(1)} within budget of ₹${Number(budget).toLocaleString("en-IN")}`
        );
      } else {
        const all = await api.getVendors(location);
        setVendors(all.data || []);
        setRecommendation(`Showing all vendors available in ${location.charAt(0).toUpperCase() + location.slice(1)}`);
      }
      setSearched(true);
    } catch {
      try {
        const all = await api.getVendors();
        setVendors(all.data || []);
        setSearched(true);
        setRecommendation("Showing all available vendors");
      } catch {
        setError("Could not connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  }

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
            AI Vendor Recommendation
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl md:text-5xl font-bold leading-tight"
          >
            Find your best installer, <span className="text-gradient-solar">instantly</span>
          </motion.h2>
        </motion.div>

        {/* Filter Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-premium-dark rounded-3xl p-6 mb-10 grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Budget (₹)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 150000"
              className="w-full rounded-xl bg-muted/40 border border-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar-glow"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl bg-muted/40 border border-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar-glow"
            >
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleRecommend}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-solar text-primary-foreground text-sm font-semibold shadow-glow hover:shadow-xl transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Finding..." : "Find Best Vendor"}
          </motion.button>
        </motion.div>

        {error && <p className="text-center text-red-400 text-sm mb-6">{error}</p>}

        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-premium rounded-2xl px-6 py-4 mb-8 text-sm text-center text-muted-foreground"
          >
            {recommendation}
          </motion.div>
        )}

        {searched && vendors.length === 0 && !error && (
          <p className="text-center text-muted-foreground text-sm">No vendors found for your criteria.</p>
        )}

        <div className="space-y-4">
          {vendors.map((v, i) => {
            const isBest  = i === 0;
            const price   = v.price_per_kw_inr ?? (v as any).price_per_kw ?? 0;
            const warranty = v.warranty_years ?? (v as any).warranty ?? 0;
            const score   = v.score ? Math.round(v.score * 100) : null;

            return (
              <motion.div
                key={(v.id ?? v.name) + i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ x: 4, y: -2 }}
                className={`glass-premium-dark rounded-3xl p-7 hover-lift relative overflow-hidden group cursor-pointer transition-all ${
                  isBest ? "ring-2 ring-solar-glow shadow-glow" : ""
                }`}
              >
                {isBest && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-gradient-solar px-3 py-1 text-xs font-bold text-primary-foreground shadow-glow mb-4">
                    <Crown className="h-3 w-3" />
                    Best Choice
                  </div>
                )}

                <motion.div
                  className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 blur-3xl group-hover:opacity-20 transition-opacity"
                  style={{ background: isBest ? "var(--gradient-solar)" : "var(--gradient-sky)" }}
                />

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center relative z-10">
                  <div className="md:col-span-2">
                    <motion.div whileHover={{ color: "var(--solar-glow)" }} className="font-bold text-lg transition-colors">
                      {v.name}
                    </motion.div>
                    <div className="flex items-center gap-1 mt-2">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-4 w-4 transition-colors ${
                            idx < Math.round(v.rating) ? "fill-solar-glow text-solar-glow" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-semibold text-muted-foreground">{v.rating}</span>
                    </div>
                  </div>

                  <Stat label="Per kW"   value={`₹${(price / 1000).toFixed(0)}k`} />
                  <Stat label="Warranty" value={`${warranty} yrs`} />
                  <Stat label="Location" value={v.location_matched ? "Matched" : "Nearby"} highlight={v.location_matched} />

                  {score !== null ? (
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Score</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 rounded-full bg-muted/60 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                            className="h-full bg-gradient-solar rounded-full"
                          />
                        </div>
                        <span className="text-sm font-bold min-w-[2rem] text-right">{score}</span>
                      </div>
                    </div>
                  ) : <div />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className={`font-bold mt-1 ${highlight ? "text-solar-glow" : "text-primary"}`}>{value}</div>
    </motion.div>
  );
}
