import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sun, Building2, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import { VendorAuthProvider, useVendorAuth } from "@/store/vendorAuthStore";
import { VendorAuthModal } from "@/components/vendor/VendorAuthModal";
import { VendorDashboard } from "@/components/vendor/VendorDashboard";

export const Route = createFileRoute("/vendor")({
  component: () => (
    <VendorAuthProvider>
      <VendorPage />
    </VendorAuthProvider>
  ),
  head: () => ({
    meta: [
      { title: "Vendor Portal – SolarWise" },
      { name: "description", content: "Register as a solar vendor on SolarWise. Manage your profile, upload documents, and get verified." },
    ],
  }),
});

function VendorPage() {
  const { isLoggedIn } = useVendorAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  if (isLoggedIn) return <VendorDashboard />;

  return (
    <>
      <VendorAuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialTab={authTab} />

      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <div className="mx-auto max-w-5xl w-full">

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-premium px-4 py-2 rounded-full mb-6">
              <Sun className="h-4 w-4 text-solar-glow" />
              <span className="text-sm font-semibold">SolarWise Vendor Portal</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Grow your solar<br />
              <span className="text-gradient-solar">installation business</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Join India's leading solar platform. Get verified, reach thousands of customers, and manage your business — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setAuthTab("register");
                  setAuthOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-solar text-primary-foreground font-semibold shadow-glow hover:shadow-xl transition-all"
              >
                Register as Vendor <ArrowRight className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}
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

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: "Easy Registration", desc: "Register your company in minutes. Upload GST, PAN, license, and photo to get verified." },
              { icon: ShieldCheck, title: "Verified Badge", desc: "Get a verified badge once documents are approved. Build trust with customers instantly." },
              { icon: TrendingUp, title: "More Leads", desc: "Appear in our recommendation engine. Get matched with customers based on location and price." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass-premium-dark rounded-3xl p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-solar shadow-glow mb-4">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
