import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Search,
  Building2,
} from "lucide-react";
import { adminApi, AdminVendor } from "@/lib/adminApi";

const STATUS_TABS = ["all", "pending", "approved", "rejected"] as const;
type StatusFilter = (typeof STATUS_TABS)[number];

const STATUS_CFG = {
  pending: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Pending" },
  approved: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-400/10",
    label: "Approved",
  },
  rejected: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Rejected" },
};

export function AdminVendors() {
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getVendors(filter === "all" ? undefined : filter);
      const data = (res.data ?? []).map((v) => ({
        ...v,
        price_per_kw: v.price_per_kw ?? 0,
        documents: v.documents ?? [],
        doc_count: v.doc_count ?? 0,
        status: ((v.status as string) === "under_review"
          ? "pending"
          : v.status) as AdminVendor["status"],
      }));
      setVendors(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const filtered = vendors.filter(
    (v) =>
      (v.company_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (v.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await adminApi.approveVendor(id);
      await load();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget);
    try {
      await adminApi.rejectVendor(
        rejectTarget,
        rejectReason || "Does not meet platform requirements",
      );
      setRejectTarget(null);
      setRejectReason("");
      await load();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Vendor Verification</h1>
        <p className="text-muted-foreground mt-1">
          {loading ? "Loading..." : `${vendors.length} vendor${vendors.length !== 1 ? "s" : ""} total`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input/60 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all"
          />
        </div>
        <div className="flex gap-2">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${filter === s ? "bg-gradient-solar text-primary-foreground shadow-glow" : "glass-premium text-muted-foreground hover:text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Reject modal */}
      <AnimatePresence>
        {rejectTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="glass-premium-dark rounded-3xl p-8 w-full max-w-md"
            >
              <h3 className="font-bold text-lg mb-2">Reject Vendor</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Provide a reason for rejection (optional)
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Incomplete documents, invalid GST number..."
                rows={3}
                className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRejectTarget(null);
                    setRejectReason("");
                  }}
                  className="flex-1 py-2.5 rounded-xl glass-premium text-sm font-semibold hover:shadow-glow transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!!actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Vendor list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-premium rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-premium-dark rounded-3xl p-16 text-center text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-semibold">No vendors found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => {
            const status = v.status && STATUS_CFG[v.status] ? v.status : "pending";
            const cfg = STATUS_CFG[status];
            const StatusIcon = cfg.icon;
            const isExpanded = expanded === v.id;

            return (
              <motion.div
                key={v.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-premium-dark rounded-2xl overflow-hidden"
              >
                {/* Row */}
                <div className="flex items-center gap-4 p-5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${cfg.bg}`}
                  >
                    <StatusIcon className={`h-5 w-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{v.company_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {v.email} · {v.location || "—"} · ₹{(v.price_per_kw ?? 0).toLocaleString("en-IN")}/kW
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{v.doc_count}/4 docs</span>

                    {status === "pending" && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(v.id)}
                          disabled={actionLoading === v.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/30 transition-all disabled:opacity-60"
                        >
                          {actionLoading === v.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setRejectTarget(v.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-all"
                        >
                          <XCircle className="h-3 w-3" /> Reject
                        </motion.button>
                      </>
                    )}

                    <button
                      onClick={() => setExpanded(isExpanded ? null : v.id)}
                      className="p-1.5 rounded-lg glass-premium hover:shadow-glow transition-all"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded documents */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/30 px-5 pb-5 pt-4 overflow-hidden"
                    >
                      {/* Vendor details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {[
                          { label: "Phone", value: v.phone || "—" },
                          { label: "Experience", value: v.experience_years ? `${v.experience_years} yrs` : "—" },
                          { label: "Rating", value: v.rating ? `${v.rating} ★` : "No rating" },
                          { label: "Joined", value: v.created_at ? v.created_at.split("T")[0] : "—" },
                        ].map(({ label, value }) => (
                          <div key={label} className="glass-premium rounded-xl px-3 py-2">
                            <div className="text-xs text-muted-foreground">{label}</div>
                            <div className="text-sm font-semibold mt-0.5">{value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                        Uploaded Documents
                      </div>
                      {(v.documents ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {(v.documents ?? []).map((doc) => (
                            <a
                              key={doc.id}
                              href={doc.filename}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="glass-premium rounded-xl p-3 hover:shadow-glow transition-all block group"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="h-4 w-4 text-solar-glow shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-semibold uppercase">
                                  {doc.doc_type}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {doc.original_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : "—"}
                              </div>
                              <div className="text-xs text-solar-glow mt-1 font-semibold">
                                Click to view ↗
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                      {v.rejection_reason && (
                        <div className="mt-3 text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2">
                          Rejection reason: {v.rejection_reason}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
