import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, Shield } from "lucide-react";

const links = [
  { href: "#features", label: "Features" },
  { href: "#calculator", label: "Calculator" },
  { href: "#schemes", label: "Schemes" },
  { href: "#vendors", label: "Vendors" },
  { href: "#cleaning", label: "Cleaning" },
  { href: "#emi", label: "EMI" },
];

const portalLinks = [
  { href: "/vendor", label: "Vendor Portal", accent: false },
  { href: "/cleaner", label: "Cleaner Portal", accent: false },
  { href: "/admin", label: "Admin", accent: true },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`flex items-center justify-between rounded-2xl px-6 py-3 transition-all duration-300 ${
            scrolled ? "glass-premium-dark shadow-glow" : "glass-premium"
          }`}
        >
          {/* Logo */}
          <motion.a
            href="#top"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 font-display font-bold text-lg"
          >
            <motion.span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-solar shadow-glow"
              whileHover={{ rotate: 12 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sun className="h-5 w-5 text-primary-foreground" />
            </motion.span>
            <span className="text-gradient-solar">SolarWise</span>
          </motion.a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {links.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors relative group"
              >
                {l.label}
                <motion.span
                  className="absolute -bottom-0.5 left-0 h-0.5 bg-gradient-solar rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.25 }}
                />
              </motion.a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <motion.button
              onClick={() => setDark((d) => !d)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl glass-premium hover:shadow-glow transition-all"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>

            {/* Portal buttons — desktop */}
            <div className="hidden md:flex items-center gap-2">
              <motion.a
                href="/vendor"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass-premium text-sm font-semibold hover:shadow-glow transition-all"
              >
                Vendor
              </motion.a>
              <motion.a
                href="/cleaner"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass-premium text-sm font-semibold hover:shadow-glow transition-all"
              >
                Cleaner
              </motion.a>
              <motion.a
                href="/admin"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-solar text-primary-foreground text-sm font-semibold shadow-glow hover:shadow-xl transition-all"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </motion.a>
            </div>

            {/* Mobile menu button */}
            <motion.button
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl glass-premium hover:shadow-glow transition-all"
              onClick={() => setOpen((o) => !o)}
              whileTap={{ scale: 0.9 }}
              aria-label="Menu"
            >
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-2 glass-premium-dark rounded-2xl p-4 overflow-hidden"
            >
              <div className="space-y-1">
                {links.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="block text-sm font-medium px-4 py-3 rounded-xl hover:bg-muted/60 transition-colors"
                  >
                    {l.label}
                  </motion.a>
                ))}
                <div className="pt-2 border-t border-border/30 mt-2 space-y-2">
                  {portalLinks.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        l.accent
                          ? "bg-gradient-solar text-primary-foreground shadow-glow"
                          : "glass-premium hover:shadow-glow"
                      }`}
                    >
                      {l.accent && <Shield className="h-4 w-4" />}
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
