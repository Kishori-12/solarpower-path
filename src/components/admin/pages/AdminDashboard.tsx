import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Building2, Zap, IndianRupee, Leaf, TrendingUp, Clock } from "lucide-react";
import { adminApi, Analytics } from "@/lib/adminApi";

export function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getAnalytics()
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  const ov = data?.overview;
  const vs = data?.vendor_status;

  const stats = [
    {
      label: "Total Users",
      value: ov?.total_users ?? 0,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Total Vendors",
      value: ov?.total_vendors ?? 0,
      icon: Building2,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "Calculations",
      value: ov?.total_calculations ?? 0,
      icon: Zap,
      color: "text-solar-glow",
      bg: "bg-solar/10",
    },
    {
      label: "Total Savings (₹)",
      value: ov?.total_savings_inr ?? 0,
      icon: IndianRupee,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      format: "currency",
    },
    {
      label: "CO₂ Offset (kg)",
      value: ov?.total_co2_offset_kg ?? 0,
      icon: Leaf,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Avg System (kW)",
      value: ov?.avg_system_size_kw ?? 0,
      icon: TrendingUp,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      decimal: true,
    },
    {
      label: "Pending Vendors",
      value: vs?.pending ?? 0,
      icon: Clock,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview at a glance</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="glass-premium rounded-2xl p-6 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg, format, decimal }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="glass-premium rounded-2xl p-6 cursor-default"
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} mb-3`}
              >
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="text-2xl font-bold">
                {format === "currency"
                  ? `₹${(value / 1000).toFixed(0)}k`
                  : decimal
                    ? value.toFixed(1)
                    : value.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">{label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Vendor status breakdown */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 glass-premium-dark rounded-3xl p-6"
        >
          <h2 className="font-bold text-lg mb-4">Vendor Verification Status</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Pending", value: vs?.pending ?? 0, color: "bg-yellow-400" },
              { label: "Approved", value: vs?.approved ?? 0, color: "bg-green-400" },
              { label: "Rejected", value: vs?.rejected ?? 0, color: "bg-red-400" },
            ].map(({ label, value, color }) => {
              const total = (vs?.pending ?? 0) + (vs?.approved ?? 0) + (vs?.rejected ?? 0);
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{label}</span>
                    <span className="text-muted-foreground">
                      {value} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Location distribution */}
      {data && Object.keys(data.location_distribution).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 glass-premium-dark rounded-3xl p-6"
        >
          <h2 className="font-bold text-lg mb-4">Vendor Location Distribution</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.location_distribution).map(([loc, count]) => (
              <div key={loc} className="glass-premium rounded-xl px-4 py-2 text-sm">
                <span className="capitalize font-semibold">{loc}</span>
                <span className="text-muted-foreground ml-2">
                  {count} vendor{count !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
