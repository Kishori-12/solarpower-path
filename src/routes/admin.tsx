import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Loader2, Shield, BarChart3,
  Users, Building2, FileText, ArrowRight, X,
} from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/store/adminAuthStore";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/pages/AdminDashboard";
import { AdminVendors } from "@/components/admin/pages/AdminVendors";
import { AdminUsers } from "@/components/admin/pages/AdminUsers";
import { AdminSchemes } from "@/components/admin/pages/AdminSchemes";
import { AdminAnalytics } from "@/components/admin/pages/AdminAnalytics";

type Page = "dashboard" | "vendors" | "users" | "schemes" | "analytics";

export const Route = createFileRoute("/admin")({
  component: () => (
    <AdminAuthProvider>
      <AdminPage />
    </AdminAuthProvider>
  ),
  head: () => ({
    meta: [
      { title: "Admin Panel – SolarWise" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AdminPage() {
  const { isLoggedIn } = useAdminAuth();
  const [page, setPage] = useState<Page>("dashboard");

  if (!isLoggedIn) return <AdminLanding />;

  const PAGE_MAP: Record<Page, JSX.Element> = {
    dashboard: <AdminDashboard />,
    vendors:   <AdminVendors />,
    users:     <AdminUsers />,
    schemes:   <AdminSchemes />,
    analytics: <AdminAnalytics />,
  };

  return (
    <AdminLayout page={page} onNavigate={setPage}>
      {PAGE_MAP[page]}
    </AdminLayout>
  );
}

// ── Landing page with modal login ─────────────────────────
function AdminLanding() {
  const [modalOpen, setModalOpen] = useState(false);

  const features = [
    { icon: Building2, title: "Vendor Verification",  desc: "Review, approve or reject vendor applications with full document inspection." },
    { icon: Users,     title: "User Management",      desc: "View all registered users, track activity and manage accounts." },
    { icon: FileText,  title: "Schemes CRUD",         desc: "Create, update and delete government solar subsidy schemes in real time." },
    { icon: BarChart3, title: "Platform Analytics",   desc: "Monitor registrations, savings, CO₂ offset and system-wide KPIs." },
  ];

  return (
    <>
      <AdminLoginModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="min-h-screen px-4 py-24">
        <div className="mx-auto max-w-5xl">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 glass-premium px-4 py-2 rounded-full mb-6"
            >
              <Shield className="h-4 w-4 text-solar-glow" />
              <span className="text-sm font-semibold">SolarWise Admin Portal</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              Platform control,<br />
              <span className="text-gradient-solar">all in one place</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-xl mx-auto mb-10"
            >
              Manage vendors, users, schemes and analytics from a single secure dashboard. Restricted to authorized administrators only.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-solar text-primary-foreground font-semibold shadow-glow hover:shadow-xl transition-all"
              >
                <Shield className="h-5 w-5" />
                Admin Sign In
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                whileHover={{ y: -4 }}
                className="glass-premium-dark rounded-3xl p-7 flex gap-5 items-start"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-solar shadow-glow">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Security note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Shield className="h-4 w-4" />
            <span>Protected by JWT role-based authentication · Admin access only</span>
          </motion.div>
        </div>
      </div>
    </>
  );
}

// ── Login modal ───────────────────────────────────────────
function AdminLoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAdminAuth();
  const [email, setEmail]       = useState("admin@solarwise.in");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
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
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-premium-dark rounded-3xl p-8 w-full max-w-sm relative"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-xl glass-premium hover:shadow-glow transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-solar shadow-glow">
                <Sun className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-xl text-gradient-solar">SolarWise</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Shield className="h-3 w-3" />
                  Admin Portal · Restricted Access
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-1">Administrator Sign In</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Enter your admin credentials to access the control panel.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-gradient-solar text-primary-foreground font-semibold shadow-glow hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                {loading ? "Authenticating..." : "Sign In to Admin Panel"}
              </motion.button>
            </form>

            {/* Default creds hint */}
            <div className="mt-5 p-3.5 rounded-xl bg-muted/30 border border-border/30">
              <div className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Default Credentials
              </div>
              <div className="text-xs text-muted-foreground font-mono space-y-0.5">
                <div>admin@solarwise.in</div>
                <div>admin123</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
