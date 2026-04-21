import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Save, Loader2, FileText, ExternalLink } from "lucide-react";
import { adminApi, AdminScheme, SchemeInput } from "@/lib/adminApi";

const EMPTY: SchemeInput = {
  name: "", provider: "", subsidy_percent: 0,
  max_subsidy_inr: 0, eligibility: "", link: "", active: true,
};

export function AdminSchemes() {
  const [schemes, setSchemes] = useState<AdminScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<SchemeInput>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = () =>
    adminApi.getSchemes().then((r) => setSchemes(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const set = (k: keyof SchemeInput, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); setError(""); };
  const openEdit = (s: AdminScheme) => {
    setForm({ name: s.name, provider: s.provider, subsidy_percent: s.subsidy_percent, max_subsidy_inr: s.max_subsidy_inr, eligibility: s.eligibility, link: s.link, active: s.active });
    setEditId(s.id); setShowForm(true); setError("");
  };

  const handleSave = async () => {
    if (!form.name || !form.provider || !form.eligibility) { setError("Name, provider, and eligibility are required"); return; }
    setSaving(true); setError("");
    try {
      if (editId) await adminApi.updateScheme(editId, form);
      else await adminApi.createScheme(form);
      setShowForm(false); setEditId(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await adminApi.deleteScheme(id); await load(); }
    finally { setDeleteTarget(null); }
  };

  const inputCls = "w-full rounded-xl bg-input/60 border border-border/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar transition-all";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Schemes</h1>
          <p className="text-muted-foreground mt-1">Manage government solar subsidy schemes</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-solar text-primary-foreground text-sm font-semibold shadow-glow hover:shadow-xl transition-all"
        >
          <Plus className="h-4 w-4" /> Add Scheme
        </motion.button>
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-premium-dark rounded-3xl p-8 w-full max-w-sm text-center"
            >
              <Trash2 className="h-10 w-10 text-red-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Delete Scheme?</h3>
              <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl glass-premium text-sm font-semibold">Cancel</button>
                <button onClick={() => handleDelete(deleteTarget)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass-premium-dark rounded-3xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{editId ? "Edit Scheme" : "Add New Scheme"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg glass-premium hover:shadow-glow transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Scheme Name *" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
              <input placeholder="Provider *" value={form.provider} onChange={(e) => set("provider", e.target.value)} className={inputCls} />
              <input type="number" placeholder="Subsidy %" value={form.subsidy_percent} onChange={(e) => set("subsidy_percent", +e.target.value)} min={0} max={100} className={inputCls} />
              <input type="number" placeholder="Max Subsidy (₹)" value={form.max_subsidy_inr} onChange={(e) => set("max_subsidy_inr", +e.target.value)} min={0} className={inputCls} />
              <input placeholder="Eligibility *" value={form.eligibility} onChange={(e) => set("eligibility", e.target.value)} className={inputCls} />
              <input placeholder="Link (URL)" value={form.link} onChange={(e) => set("link", e.target.value)} className={inputCls} />
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-solar" />
                <label htmlFor="active" className="text-sm font-medium">Active (visible to users)</label>
              </div>
            </div>
            {error && <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2 mt-3">{error}</p>}
            <div className="flex justify-end mt-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-solar text-primary-foreground text-sm font-semibold shadow-glow disabled:opacity-60 transition-all"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editId ? "Update" : "Create"} Scheme
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schemes list */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-premium rounded-2xl h-24 animate-pulse" />)}</div>
      ) : schemes.length === 0 ? (
        <div className="glass-premium-dark rounded-3xl p-16 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-semibold">No schemes yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schemes.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-premium-dark rounded-2xl p-5 flex items-center gap-4"
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${s.active ? "bg-green-400/10" : "bg-muted/30"}`}>
                <FileText className={`h-5 w-5 ${s.active ? "text-green-400" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{s.name}</span>
                  {!s.active && <span className="text-xs px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground">Inactive</span>}
                </div>
                <div className="text-sm text-muted-foreground">{s.provider} · {s.subsidy_percent}% subsidy · up to ₹{s.max_subsidy_inr.toLocaleString("en-IN")}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.eligibility}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {s.link && (
                  <a href={s.link} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg glass-premium hover:shadow-glow transition-all text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg glass-premium hover:shadow-glow transition-all">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => setDeleteTarget(s.id)} className="p-1.5 rounded-lg bg-red-400/10 hover:bg-red-400/20 transition-all text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
