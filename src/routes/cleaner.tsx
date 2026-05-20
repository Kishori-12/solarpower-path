import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, ShieldCheck, ArrowRight, X, Loader2 } from "lucide-react";

export const Route = createFileRoute("/cleaner")({
  component: CleanerPage,
  head: () => ({
    meta: [
      { title: "Cleaner Portal – SolarWise" },
      {
        name: "description",
        content: "Register as a solar cleaner on SolarWise. Manage your profile and get verified.",
      },
    ],
  }),
});

function CleanerPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cleanerData, setCleanerData] = useState<any>(null);
  const [token, setToken] = useState("");
  const [uploading, setUploading] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);

      const res = await fetch("http://127.0.0.1:5000/cleaner/upload-documents", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCleanerData(data.data);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading document");
    } finally {
      setUploading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen pt-32 px-4 pb-24">
        <div className="max-w-4xl mx-auto glass-premium-dark rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-solar shadow-glow">
              <Droplets className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome, {cleanerData?.name || "Cleaner"}</h1>
              <p className="text-muted-foreground">Manage your cleaning services and profile.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Section */}
            <div className="glass-premium rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                Profile Details
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Email:</span> {cleanerData?.email}
                </p>
                <p>
                  <span className="text-muted-foreground">Mobile:</span>{" "}
                  {cleanerData?.mobile || "Not provided"}
                </p>
                <p>
                  <span className="text-muted-foreground">Address:</span>{" "}
                  {cleanerData?.address || "Not provided"}
                </p>
              </div>
            </div>

            {/* Verification Section */}
            <div className="glass-premium rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-solar-glow" />
                Verification Status
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {cleanerData?.verified
                  ? "You are a verified professional!"
                  : cleanerData?.status === "under_review"
                    ? "Documents submitted. Pending admin approval."
                    : "Your profile is pending verification. Please upload required documents (ID Proof, Address Proof, and Training Certificate)."}
              </p>
              {!cleanerData?.verified && cleanerData?.status !== "under_review" && (
                <div className="relative inline-block">
                  <input
                    type="file"
                    id="doc-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                  <button
                    disabled={uploading}
                    className="px-4 py-2 rounded-lg bg-gradient-solar text-primary-foreground text-sm font-semibold flex items-center gap-2"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {uploading ? "Uploading..." : "Upload Documents"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setIsLoggedIn(false);
              setCleanerData(null);
              setToken("");
            }}
            className="mt-8 text-sm text-red-400 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CleanerAuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialTab={authTab}
        onSuccess={(data, token) => {
          setCleanerData(data);
          setToken(token);
          setIsLoggedIn(true);
          setAuthOpen(false);
        }}
      />

      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <div className="mx-auto max-w-5xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 glass-premium px-4 py-2 rounded-full mb-6">
              <Droplets className="h-4 w-4 text-solar-glow" />
              <span className="text-sm font-semibold">SolarWise Cleaner Portal</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Offer your <span className="text-gradient-solar">cleaning services</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Join our platform to offer solar panel maintenance and cleaning. Get verified and
              connect with solar owners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setAuthTab("register");
                  setAuthOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-solar text-primary-foreground font-semibold shadow-glow hover:shadow-xl transition-all"
              >
                Register as Cleaner <ArrowRight className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setAuthTab("login");
                  setAuthOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass-premium-dark font-semibold hover:bg-muted/60 transition-colors"
              >
                Sign In
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

function CleanerAuthModal({
  open,
  onClose,
  initialTab,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  initialTab: "login" | "register";
  onSuccess: (data: any, token: string) => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", mobile: "", address: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = tab === "login" ? "/cleaner/login" : "/cleaner/register";
      const res = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Authentication failed");

      onSuccess(data.data.cleaner, data.data.token);
    } catch (err: any) {
      setError(err.message);
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
            <button
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-xl glass-premium"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 mb-6">
              <Droplets className="h-6 w-6 text-solar-glow" />
              <span className="font-bold text-lg text-gradient-solar">Cleaner Portal</span>
            </div>
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
                <>
                  <input
                    type="text"
                    placeholder="Full Name or Company Name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={form.mobile}
                    onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                    required
                    className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    required
                    className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all"
                  />
                </>
              )}
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all"
              />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all"
              />
              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-solar text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {tab === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
