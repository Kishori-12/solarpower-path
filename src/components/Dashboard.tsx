import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, IndianRupee, Calendar, Leaf, LogOut, User } from "lucide-react";
import { useAuth } from "@/store/authStore";
import { api, SavedCalc } from "@/lib/api";

export function Dashboard() {
  const { user, logout, isLoggedIn } = useAuth();
  const [calcs, setCalcs] = useState<SavedCalc[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    api
      .myCalculations()
      .then((res) => setCalcs(res.data))
      .catch(() => setCalcs([]))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  return (
    <section id="dashboard" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex items-center justify-between"
        >
          <div>
            <span className="inline-block rounded-full glass-premium px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-solar-glow mb-4">
              My Dashboard
            </span>
            <h2 className="text-4xl md:text-5xl font-bold">
              Welcome back, <span className="text-gradient-solar">{user?.name}</span>
            </h2>
            <p className="text-muted-foreground mt-2">{user?.email}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-premium text-sm font-semibold hover:shadow-glow transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Calculations", value: calcs.length, icon: Zap, suffix: "" },
            {
              label: "Total Savings/yr",
              value: calcs.reduce(
                (s, c) => s + ((c.results as any)?.financials?.annual_savings_inr ?? 0),
                0,
              ),
              icon: IndianRupee,
              prefix: "₹",
            },
            {
              label: "CO₂ Offset/yr",
              value: calcs.reduce(
                (s, c) => s + ((c.results as any)?.environment?.co2_offset_kg_per_year ?? 0),
                0,
              ),
              icon: Leaf,
              suffix: " kg",
            },
            {
              label: "Member Since",
              value: user?.created_at?.split("T")[0] ?? "—",
              icon: User,
              raw: true,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="glass-premium rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="h-4 w-4 text-solar-glow" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-gradient-solar">
                {stat.raw
                  ? stat.value
                  : `${stat.prefix ?? ""}${typeof stat.value === "number" ? stat.value.toLocaleString("en-IN") : stat.value}${stat.suffix ?? ""}`}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Saved calculations */}
        <h3 className="text-xl font-bold mb-4">Saved Calculations</h3>

        {loading && <div className="text-center text-muted-foreground py-12">Loading...</div>}

        {!loading && calcs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-premium rounded-3xl p-12 text-center text-muted-foreground"
          >
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold">No saved calculations yet.</p>
            <p className="text-sm mt-1">Run a calculation and save it to see it here.</p>
          </motion.div>
        )}

        <div className="space-y-4">
          {calcs.map((calc, i) => {
            const inp = calc.inputs as any;
            const fin = (calc.results as any)?.financials;
            const sys = (calc.results as any)?.system;
            return (
              <motion.div
                key={calc.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass-premium-dark rounded-3xl p-6 grid grid-cols-2 md:grid-cols-5 gap-4 items-center"
              >
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Location
                  </div>
                  <div className="font-bold capitalize">{inp?.location ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Monthly Bill
                  </div>
                  <div className="font-bold">
                    ₹{inp?.monthly_bill_inr?.toLocaleString("en-IN") ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    System Size
                  </div>
                  <div className="font-bold text-gradient-solar">
                    {sys?.recommended_capacity_kw ?? "—"} kW
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Annual Savings
                  </div>
                  <div className="font-bold text-gradient-solar">
                    ₹{fin?.annual_savings_inr?.toLocaleString("en-IN") ?? "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {calc.saved_at?.split("T")[0]}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
