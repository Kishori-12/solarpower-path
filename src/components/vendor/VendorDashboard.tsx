import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  LogOut,
  Sun,
  Edit2,
  Save,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useVendorAuth } from "@/store/vendorAuthStore";
import { vendorApi, VendorStatus, VendorDocument } from "@/lib/vendorApi";

type Tab = "profile" | "documents" | "status";

const DOC_TYPES = [
  { key: "gst", label: "GST Certificate", accept: ".pdf,.jpg,.jpeg,.png" },
  { key: "pan", label: "PAN Card", accept: ".pdf,.jpg,.jpeg,.png" },
  { key: "license", label: "Business License", accept: ".pdf,.jpg,.jpeg,.png" },
  { key: "photo", label: "Company Photo", accept: ".jpg,.jpeg,.png" },
];

const LOCATIONS: Record<string, string> = {
  north: "North India",
  south: "South India",
  east: "East India",
  west: "West India",
  central: "Central India",
};

function formatIstDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    label: "Pending Review",
  },
  under_review: {
    icon: Clock,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    label: "Under Review",
  },
  approved: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-400/10",
    label: "Approved",
  },
  rejected: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Rejected" },
};

export function VendorDashboard() {
  const { vendor, logout, refreshVendor } = useVendorAuth();
  const [tab, setTab] = useState<Tab>("profile");
  const [status, setStatus] = useState<VendorStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    company_name: vendor?.company_name ?? "",
    phone: vendor?.phone ?? "",
    location: vendor?.location ?? "south",
    price_per_kw: String(vendor?.price_per_kw ?? ""),
    experience_years: String(vendor?.experience_years ?? ""),
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Upload state
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadMsg, setUploadMsg] = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (tab === "status" || tab === "documents") fetchStatus();
  }, [tab]);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await vendorApi.getStatus();
      setStatus(res.data);
    } catch {
      /* ignore */
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    setProfileMsg("");
    try {
      await vendorApi.updateProfile({
        company_name: profileForm.company_name,
        phone: profileForm.phone,
        location: profileForm.location,
        price_per_kw: parseFloat(profileForm.price_per_kw),
        experience_years: parseInt(profileForm.experience_years),
      });
      await refreshVendor();
      setEditing(false);
      setProfileMsg("Profile updated successfully!");
    } catch (e: unknown) {
      setProfileMsg(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpload = async (docType: string, file: File) => {
    setUploading((u) => ({ ...u, [docType]: true }));
    setUploadMsg((m) => ({ ...m, [docType]: "" }));
    try {
      await vendorApi.uploadDocument(file, docType);
      setUploadMsg((m) => ({ ...m, [docType]: "✓ Uploaded successfully" }));
      await fetchStatus();
      await refreshVendor();
    } catch (e: unknown) {
      setUploadMsg((m) => ({ ...m, [docType]: e instanceof Error ? e.message : "Upload failed" }));
    } finally {
      setUploading((u) => ({ ...u, [docType]: false }));
    }
  };

  const statusCfg =
    STATUS_CONFIG[vendor?.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "profile", label: "Profile", icon: User },
    { key: "documents", label: "Documents", icon: FileText },
    { key: "status", label: "Status", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-solar shadow-glow">
              <Sun className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-solar">{vendor?.company_name}</h1>
              <p className="text-sm text-muted-foreground">{vendor?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${statusCfg.bg} ${statusCfg.color}`}
            >
              <StatusIcon className="h-4 w-4" />
              {statusCfg.label}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-premium text-sm font-semibold hover:shadow-glow transition-all"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 glass-premium rounded-2xl p-1.5">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === key ? "bg-gradient-solar text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Profile Tab ── */}
          {tab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-premium-dark rounded-3xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Company Profile</h2>
                {!editing ? (
                  <button
                    onClick={() => {
                      setEditing(true);
                      setProfileMsg("");
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl glass-premium text-sm font-semibold hover:shadow-glow transition-all"
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl glass-premium text-sm hover:shadow-glow transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleProfileSave}
                      disabled={savingProfile}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-solar text-primary-foreground text-sm font-semibold shadow-glow disabled:opacity-60 transition-all"
                    >
                      {savingProfile ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save
                    </button>
                  </div>
                )}
              </div>

              {profileMsg && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm rounded-lg px-3 py-2 mb-4 ${profileMsg.startsWith("✓") || profileMsg.includes("success") ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}
                >
                  {profileMsg}
                </motion.p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Company Name", key: "company_name", type: "text" },
                  { label: "Phone", key: "phone", type: "tel" },
                  { label: "Price per kW (₹)", key: "price_per_kw", type: "number" },
                  { label: "Experience (years)", key: "experience_years", type: "number" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                      {label}
                    </label>
                    {editing ? (
                      <input
                        type={type}
                        value={profileForm[key as keyof typeof profileForm]}
                        onChange={(e) => setProfileForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all"
                      />
                    ) : (
                      <div className="font-semibold px-4 py-3 rounded-xl glass-premium">
                        {key === "price_per_kw"
                          ? `₹${Number(vendor?.[key as keyof typeof vendor]).toLocaleString("en-IN")}`
                          : vendor?.[key as keyof typeof vendor]}
                      </div>
                    )}
                  </div>
                ))}

                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                    Location
                  </label>
                  {editing ? (
                    <select
                      value={profileForm.location}
                      onChange={(e) => setProfileForm((f) => ({ ...f, location: e.target.value }))}
                      className="w-full rounded-xl bg-input/60 border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all"
                    >
                      {Object.entries(LOCATIONS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="font-semibold px-4 py-3 rounded-xl glass-premium capitalize">
                      {LOCATIONS[vendor?.location ?? ""] ?? vendor?.location}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                    Member Since
                  </label>
                  <div className="font-semibold px-4 py-3 rounded-xl glass-premium">
                    {formatIstDateTime(vendor?.created_at)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Documents Tab ── */}
          {tab === "documents" && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-premium-dark rounded-3xl p-8"
            >
              <h2 className="text-xl font-bold mb-2">Upload Documents</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Upload all 4 documents to complete verification. Accepted: PDF, JPG, PNG (max 5 MB
                each)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DOC_TYPES.map(({ key, label, accept }) => {
                  const uploaded = status?.documents.find((d) => d.doc_type === key);
                  const isUploading = uploading[key];
                  const msg = uploadMsg[key];

                  return (
                    <motion.div
                      key={key}
                      whileHover={{ y: -2 }}
                      className={`glass-premium rounded-2xl p-5 border-2 transition-all ${uploaded ? "border-green-400/30" : "border-border/30 hover:border-solar/30"}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold text-sm">{label}</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                            {key}
                          </div>
                        </div>
                        {uploaded ? (
                          <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                            <CheckCircle className="h-4 w-4" /> Uploaded
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                            <Clock className="h-4 w-4" /> Required
                          </div>
                        )}
                      </div>

                      {uploaded && (
                        <div className="text-xs text-muted-foreground mb-3 truncate">
                          {uploaded.original_name} · {(uploaded.file_size / 1024).toFixed(1)} KB
                        </div>
                      )}

                      <input
                        ref={(el) => {
                          fileRefs.current[key] = el;
                        }}
                        type="file"
                        accept={accept}
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(key, f);
                        }}
                      />
                      <button
                        onClick={() => fileRefs.current[key]?.click()}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl glass-premium text-sm font-semibold hover:shadow-glow transition-all disabled:opacity-60"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {isUploading ? "Uploading..." : uploaded ? "Re-upload" : "Upload"}
                      </button>

                      {msg && (
                        <p
                          className={`text-xs mt-2 ${msg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}
                        >
                          {msg}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Status Tab ── */}
          {tab === "status" && (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Status card */}
              <div className="glass-premium-dark rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-6">Verification Status</h2>

                {loadingStatus ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-solar-glow" />
                  </div>
                ) : (
                  <>
                    <div className={`flex items-center gap-4 p-5 rounded-2xl mb-6 ${statusCfg.bg}`}>
                      <StatusIcon className={`h-10 w-10 ${statusCfg.color}`} />
                      <div>
                        <div className={`text-xl font-bold ${statusCfg.color}`}>
                          {statusCfg.label}
                        </div>
                        {vendor?.status === "pending" && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Your documents are under review. This usually takes 1–2 business days.
                          </p>
                        )}
                        {vendor?.status === "under_review" && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Your documents are under review. This usually takes 1–2 business days.
                          </p>
                        )}
                        {vendor?.status === "approved" && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Your profile is live and visible to customers.
                          </p>
                        )}
                        {vendor?.status === "rejected" && vendor.rejection_reason && (
                          <p className="text-sm text-red-300 mt-1">
                            Reason: {vendor.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Document Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {status?.verification_progress}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((status?.documents.length ?? 0) / 4) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-solar rounded-full"
                        />
                      </div>
                    </div>

                    {/* Document checklist */}
                    <div className="grid grid-cols-2 gap-3">
                      {DOC_TYPES.map(({ key, label }) => {
                        const doc = status?.documents.find(
                          (d: VendorDocument) => d.doc_type === key,
                        );
                        return (
                          <div
                            key={key}
                            className={`flex items-center gap-3 p-3 rounded-xl ${doc ? "glass-premium" : "glass-premium opacity-50"}`}
                          >
                            {doc ? (
                              <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0" />
                            )}
                            <div>
                              <div className="text-sm font-semibold">{label}</div>
                              <div className="text-xs text-muted-foreground">
                                {doc
                                  ? `Uploaded ${formatIstDateTime(doc.uploaded_at)}`
                                  : "Not uploaded"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {(status?.missing_documents?.length ?? 0) > 0 && (
                      <div className="mt-4 flex items-start gap-2 p-4 rounded-xl bg-yellow-400/10 text-yellow-400">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <p className="text-sm">
                          Missing: <strong>{status?.missing_documents.join(", ")}</strong>. Upload
                          them in the Documents tab to complete verification.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
