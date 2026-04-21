import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sun, Loader2 } from "lucide-react";
import { useVendorAuth } from "@/store/vendorAuthStore";

interface Props { open: boolean; onClose: () => void; }

const LOCATIONS = ["north", "south", "east", "west", "central"];

const LOCATION_LABELS: Record<string, string> = {
  north: "North India", south: "South India",
  east: "East India", west: "West India", central: "Central India",
};

export function VendorAuthModal({ open, onClose }: Props) {
  const { login, register } = useVendorAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    company_name: "", email: "", password: "",
    phone: "", location: "south", price_per_kw: "50000", experience_years: "5",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (tab === "login") {
        await login(form.email, form.password);
      } else {
        await register({
          company_name: form.company_name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          location: form.location,
          price_per_kw: parseFloat(form.price_per_kw),
          experience_years: parseInt(form.experience_years),
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-premium-dark rounded-3xl p-8 w-full max-w-md relative my-8"
          >
            <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-xl glass-premium hover:shadow-glow transition-all">
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-solar shadow-glow">
                <Sun className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-lg text-gradient-solar">Vendor Portal</span>
                <p className="text-xs text-muted-foreground">SolarWise Partner</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex rounded-xl glass-premium p-1 mb-6">
              {(["login", "register"] as const).map((t) => (
                <button key={t} onClick={() => { setTab(t); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? "bg-gradient-solar text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {tab === "register" && (
                <>
                  <input type="text" placeholder="Company Name" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} required className={inputCls} />
                  <input type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => set("phone", e.target.value)} required className={inputCls} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Price/kW (₹)" value={form.price_per_kw} onChange={(e) => set("price_per_kw", e.target.value)} required min={1} className={inputCls} />
                    <input type="number" placeholder="Experience (yrs)" value={form.experience_years} onChange={(e) => set("experience_years", e.target.value)} required min={0} className={inputCls} />
                  </div>
                  <select value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls}>
                    {LOCATIONS.map((l) => <option key={l} value={l}>{LOCATION_LABELS[l]}</option>)}
                  </select>
                </>
              )}
              <input type="email" placeholder="Email address" value={form.email} onChange={(e) => set("email", e.target.value)} required className={inputCls} />
              <input type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={(e) => set("password", e.target.value)} required className={inputCls} />

              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                  {error}
                </motion.p>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-solar text-primary-foreground font-semibold shadow-glow hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {tab === "login" ? "Sign In" : "Create Vendor Account"}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {tab === "login" ? "New vendor?" : "Already registered?"}{" "}
              <button onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); }} className="text-solar-glow font-semibold hover:underline">
                {tab === "login" ? "Register here" : "Sign In"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
