import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { adminApi, Analytics } from "@/lib/adminApi";

const COLORS = ["oklch(0.72 0.19 55)", "oklch(0.65 0.18 145)", "oklch(0.65 0.18 220)", "oklch(0.65 0.18 300)", "oklch(0.65 0.18 30)"];

const TOOLTIP_STYLE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
};

export function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAnalytics().then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-premium rounded-3xl h-64 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const locationData = Object.entries(data.location_distribution).map(([name, value]) => ({ name, value }));

  const vendorStatusData = [
    { name: "Pending",  value: data.vendor_status.pending,  color: COLORS[0] },
    { name: "Approved", value: data.vendor_status.approved, color: COLORS[1] },
    { name: "Rejected", value: data.vendor_status.rejected, color: "oklch(0.65 0.18 15)" },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform performance and growth metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* User registrations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-premium-dark rounded-3xl p-6"
        >
          <h2 className="font-bold text-lg mb-1">User Registrations</h2>
          <p className="text-sm text-muted-foreground mb-4">Last 7 days</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.registrations.users}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.7 0.02 80 / 0.15)" />
                <XAxis dataKey="date" stroke="currentColor" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="currentColor" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill={COLORS[0]} radius={[6, 6, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Vendor registrations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-premium-dark rounded-3xl p-6"
        >
          <h2 className="font-bold text-lg mb-1">Vendor Registrations</h2>
          <p className="text-sm text-muted-foreground mb-4">Last 7 days</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.registrations.vendors}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.7 0.02 80 / 0.15)" />
                <XAxis dataKey="date" stroke="currentColor" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="currentColor" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="count" stroke={COLORS[1]} strokeWidth={2.5} dot={{ r: 4 }} name="Vendors" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Vendor status pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-premium-dark rounded-3xl p-6"
        >
          <h2 className="font-bold text-lg mb-1">Vendor Status</h2>
          <p className="text-sm text-muted-foreground mb-4">Verification breakdown</p>
          {vendorStatusData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">No vendor data yet</div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vendorStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {vendorStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Location distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-premium-dark rounded-3xl p-6"
        >
          <h2 className="font-bold text-lg mb-1">Vendor Locations</h2>
          <p className="text-sm text-muted-foreground mb-4">Distribution by region</p>
          {locationData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">No location data yet</div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.7 0.02 80 / 0.15)" />
                  <XAxis type="number" stroke="currentColor" fontSize={10} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="currentColor" fontSize={10} width={55} tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Vendors">
                    {locationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

      </div>

      {/* Key metrics row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mt-6 grid grid-cols-3 gap-4"
      >
        {[
          { label: "Total Savings Generated", value: `₹${(data.overview.total_savings_inr / 1000).toFixed(0)}k`, sub: "across all calculations" },
          { label: "CO₂ Offset", value: `${(data.overview.total_co2_offset_kg / 1000).toFixed(1)}T`, sub: "tonnes of CO₂ saved" },
          { label: "Avg System Size", value: `${data.overview.avg_system_size_kw} kW`, sub: "per installation" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="glass-premium rounded-2xl p-5 text-center">
            <div className="text-2xl font-bold text-gradient-solar">{value}</div>
            <div className="text-sm font-semibold mt-1">{label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
