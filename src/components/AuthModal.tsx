import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sun, Loader2 } from "lucide-react";
import { useAuth } from "@/store/authStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: Props) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-premium-dark rounded-3xl p-8 w-full max-w-md relative"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-xl glass-premium hover:shadow-glow transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-solar shadow-glow">
                <Sun className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-gradient-solar">SolarWise</span>
            </div>

            {/* Tabs */}
            <div className="flex rounded-xl glass-premium p-1 mb-6">
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setError("");
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                    tab === t
                      ? "bg-gradient-solar text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === "register" && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                  className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all"
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all"
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all"
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-solar text-primary-foreground font-semibold shadow-glow hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {tab === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {tab === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setTab(tab === "login" ? "register" : "login");
                  setError("");
                }}
                className="text-solar-glow font-semibold hover:underline"
              >
                {tab === "login" ? "Register" : "Sign In"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
