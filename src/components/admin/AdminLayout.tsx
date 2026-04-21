import { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Building2, FileText,
  BarChart3, Sun, LogOut, ChevronRight,
} from "lucide-react";
import { useAdminAuth } from "@/store/adminAuthStore";

type Page = "dashboard" | "vendors" | "users" | "schemes" | "analytics";

interface Props {
  page: Page;
  onNavigate: (p: Page) => void;
  children: ReactNode;
}

const NAV = [
  { key: "dashboard" as Page,  label: "Dashboard",  icon: LayoutDashboard },
  { key: "vendors"   as Page,  label: "Vendors",    icon: Building2 },
  { key: "users"     as Page,  label: "Users",      icon: Users },
  { key: "schemes"   as Page,  label: "Schemes",    icon: FileText },
  { key: "analytics" as Page,  label: "Analytics",  icon: BarChart3 },
];

export function AdminLayout({ page, onNavigate, children }: Props) {
  const { admin, logout } = useAdminAuth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 shrink-0 glass-premium-dark border-r border-border/30 flex flex-col"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-solar shadow-glow">
            <Sun className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-gradient-solar">SolarWise</div>
            <div className="text-xs text-muted-foreground">Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ key, label, icon: Icon }) => {
            const active = page === key;
            return (
              <motion.button
                key={key}
                onClick={() => onNavigate(key)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-gradient-solar text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {active && <ChevronRight className="h-3 w-3" />}
              </motion.button>
            );
          })}
        </nav>

        {/* Admin info + logout */}
        <div className="px-3 py-4 border-t border-border/30">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass-premium mb-2">
            <div className="h-8 w-8 rounded-full bg-gradient-solar flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary-foreground">
                {admin?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{admin?.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{admin?.role}</div>
            </div>
          </div>
          <motion.button
            whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </motion.button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
