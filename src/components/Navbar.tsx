import { useEffect, useState } from "react";
import { Sun, Moon, Menu, X } from "lucide-react";

const links = [
  { href: "#features", label: "Features" },
  { href: "#calculator", label: "Calculator" },
  { href: "#schemes", label: "Schemes" },
  { href: "#vendors", label: "Vendors" },
  { href: "#emi", label: "EMI" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div
        className={`mx-auto max-w-7xl px-4 transition-all duration-300 ${
          scrolled ? "" : ""
        }`}
      >
        <nav
          className={`flex items-center justify-between rounded-2xl px-5 py-3 transition-all ${
            scrolled ? "glass-strong" : "glass"
          }`}
        >
          <a href="#top" className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-solar shadow-glow">
              <Sun className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="text-gradient-solar">SolarWise</span>
          </a>

          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-xl glass hover:scale-105 transition-transform"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <a
              href="#calculator"
              className="hidden md:inline-flex items-center justify-center rounded-xl bg-gradient-solar px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-105 transition-transform"
            >
              Get Started
            </a>
            <button
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl glass"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="md:hidden mt-2 glass-strong rounded-2xl p-4 flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium px-2 py-2 rounded-lg hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
