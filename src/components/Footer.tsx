import { Sun, Github, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-12 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-display font-bold text-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-solar shadow-glow">
                <Sun className="h-5 w-5 text-primary-foreground" />
              </span>
              <span className="text-gradient-solar">SolarWise</span>
            </div>
            <p className="mt-4 text-muted-foreground max-w-md">
              Smart solar decisions made simple. Compare schemes, calculate ROI, and choose the best
              vendors — powered by data.
            </p>
            <div className="mt-5 flex gap-3">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl glass hover:scale-110 hover:shadow-glow transition-all"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Product" links={["Calculator", "Schemes", "Vendors", "EMI"]} />
          <FooterCol title="Company" links={["About", "Contact", "Services", "Blog"]} />
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col md:flex-row gap-4 justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SolarWise. All rights reserved.
          </p>
          <p className="text-sm font-semibold text-gradient-solar">Powering a Greener Future 🌱</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="font-bold mb-4">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
