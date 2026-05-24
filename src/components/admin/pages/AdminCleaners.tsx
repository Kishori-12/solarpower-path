import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Droplets, Loader2 } from "lucide-react";

interface Cleaner {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  address?: string;
  experience: string;
  pricePerVisit: number;
  status: "pending" | "under_review" | "approved" | "rejected";
  verified: boolean;
}

export function AdminCleaners() {
  const token = localStorage.getItem("sw_admin_token") || "";
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Cleaner["status"] | "all">("all");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchCleaners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/admin/cleaners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCleaners(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCleaners();
  }, [token]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setProcessing(id);
    try {
      const res = await fetch(`http://127.0.0.1:5000/admin/cleaners/${action}/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCleaners(
          cleaners.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: action === "approve" ? "approved" : "rejected",
                  verified: action === "approve",
                }
              : c,
          ),
        );
      } else {
        alert(data.error || "Action failed");
      }
    } catch (err) {
      console.error(err);
      alert(`Error trying to ${action} cleaner`);
    } finally {
      setProcessing(null);
    }
  };

  const filtered =
    filter === "all"
      ? cleaners
      : filter === "pending"
        ? cleaners.filter((c) => c.status === "pending" || c.status === "under_review")
        : cleaners.filter((c) => c.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-gradient-solar">Cleaners Management</h1>
          <p className="text-sm text-muted-foreground">Review and manage maintenance personnel</p>
        </div>
      </div>

      <div className="flex gap-2">
        {["all", "pending", "under_review", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              filter === f
                ? "bg-gradient-solar text-primary-foreground shadow-glow"
                : "glass-premium hover:bg-muted/50"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-solar-glow" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-premium-dark rounded-3xl p-12 text-center text-muted-foreground">
          No cleaners found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-premium-dark rounded-3xl p-6 relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-solar flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {c.experience} · ₹{c.pricePerVisit}/visit
                    </p>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    c.status === "approved"
                      ? "bg-green-500/20 text-green-400"
                      : c.status === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : c.status === "under_review"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.status ? c.status.replace("_", " ") : "Unknown"}
                </div>
              </div>

              <div className="space-y-2 text-sm mb-6 bg-background/30 p-3 rounded-xl">
                <p>
                  <span className="text-muted-foreground">Email:</span> {c.email}
                </p>
                <p>
                  <span className="text-muted-foreground">Mobile:</span> {c.mobile || "N/A"}
                </p>
                <p>
                  <span className="text-muted-foreground">Address:</span> {c.address || "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 border-t border-border/30 pt-4">
                <button
                  onClick={() => handleAction(c.id, "approve")}
                  disabled={processing === c.id || c.status === "approved"}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
                >
                  {processing === c.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Approve
                </button>
                <button
                  onClick={() => handleAction(c.id, "reject")}
                  disabled={processing === c.id || c.status === "rejected"}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
                >
                  {processing === c.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
