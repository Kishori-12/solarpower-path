import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, BadgeCheck, X, ExternalLink, IndianRupee, CheckCircle, FileText } from "lucide-react";

const ALL_STATES = ["All", "Pan-India", "Maharashtra", "Gujarat", "Delhi", "Rajasthan"];

const schemes = [
  {
    title: "PM Surya Ghar Muft Bijli Yojana",
    state: "Pan-India",
    desc: "Up to ₹78,000 subsidy for rooftop solar installation. Get up to 300 free units monthly.",
    eligibility: "Residential",
    color: "var(--gradient-solar)",
    details: {
      subsidy: "Up to ₹78,000",
      capacity: "Up to 3 kW (₹30,000/kW) + 3–10 kW (₹18,000/kW)",
      benefit: "300 free electricity units per month",
      link: "https://pmsuryaghar.gov.in",
      steps: [
        "Register on pmsuryaghar.gov.in with Aadhaar & electricity bill",
        "Apply through your DISCOM (electricity distributor)",
        "Get technical feasibility approval",
        "Install via empanelled vendor",
        "Submit net-meter application & receive subsidy in bank account",
      ],
      documents: ["Aadhaar Card", "Electricity Bill", "Bank Account Details", "Roof Ownership Proof"],
    },
  },
  {
    title: "Rooftop Solar Programme Phase II",
    state: "Pan-India",
    desc: "MNRE central financial assistance for residential rooftop solar up to 10 kW capacity.",
    eligibility: "Residential",
    color: "var(--gradient-sky)",
    details: {
      subsidy: "40% for up to 3 kW; 20% for 3–10 kW",
      capacity: "Up to 10 kW per household",
      benefit: "Reduced electricity bills + net metering credits",
      link: "https://mnre.gov.in/solar/rooftop",
      steps: [
        "Visit MNRE portal and check empanelled vendors in your area",
        "Get quotation from registered installer",
        "Apply for subsidy through State Nodal Agency (SNA)",
        "Complete installation and inspection",
        "Subsidy disbursed directly to vendor, reducing your cost",
      ],
      documents: ["Identity Proof", "Address Proof", "Electricity Connection Certificate", "Bank Passbook"],
    },
  },
  {
    title: "Maharashtra Mukhyamantri Solar Yojana",
    state: "Maharashtra",
    desc: "State subsidy for agricultural pumps and rooftop installations across Maharashtra.",
    eligibility: "Farmers",
    color: "var(--gradient-eco)",
    details: {
      subsidy: "Up to 90% for farmers; 30% for residential",
      capacity: "3 kW to 7.5 kW agricultural pumps",
      benefit: "Free daytime electricity for irrigation",
      link: "https://mahadiscom.in/solar",
      steps: [
        "Apply through MSEDCL (Mahavitaran) portal",
        "Submit land records and pump details",
        "Await technical survey by MSEDCL engineer",
        "Installation by approved contractor",
        "Subsidy credited after commissioning",
      ],
      documents: ["7/12 Land Extract", "Pump Connection Bill", "Aadhaar Card", "Bank Details"],
    },
  },
  {
    title: "Surya Gujarat Yojana",
    state: "Gujarat",
    desc: "40% subsidy on systems up to 3 kW; 20% on 3–10 kW for residential users.",
    eligibility: "Residential",
    color: "var(--gradient-solar)",
    details: {
      subsidy: "40% up to 3 kW; 20% for 3–10 kW",
      capacity: "1 kW to 10 kW",
      benefit: "Net metering + sell surplus power to DGVCL/UGVCL",
      link: "https://suryagujarat.guvnl.in",
      steps: [
        "Register on Surya Gujarat portal",
        "Select empanelled installer from list",
        "Submit application with electricity bill",
        "Installation and net meter fitting",
        "Subsidy transferred within 30 days of commissioning",
      ],
      documents: ["Electricity Bill", "Aadhaar Card", "Property Tax Receipt", "Bank Account"],
    },
  },
  {
    title: "Delhi Solar Policy 2024",
    state: "Delhi",
    desc: "Generation-based incentives plus net-metering for fast urban adoption.",
    eligibility: "Residential & Commercial",
    color: "var(--gradient-sky)",
    details: {
      subsidy: "₹2/unit generation-based incentive for 5 years",
      capacity: "1 kW to 500 kW",
      benefit: "Net metering + generation incentive + reduced bills",
      link: "https://bses.in/solar",
      steps: [
        "Apply online via BSES Rajdhani / BSES Yamuna / TPDDL portal",
        "Technical feasibility check by DISCOM",
        "Install via MNRE empanelled vendor",
        "Net meter installation by DISCOM",
        "Receive generation-based incentive monthly",
      ],
      documents: ["Electricity Bill", "Aadhaar / PAN", "Building Ownership Proof", "Bank Details"],
    },
  },
  {
    title: "Rajasthan Solar Energy Policy",
    state: "Rajasthan",
    desc: "Wheeling charge waivers and land allotment for utility-scale solar projects.",
    eligibility: "Commercial",
    color: "var(--gradient-eco)",
    details: {
      subsidy: "Wheeling & transmission charge waiver",
      capacity: "Above 1 MW utility-scale projects",
      benefit: "Land at concessional rates + single-window clearance",
      link: "https://energy.rajasthan.gov.in",
      steps: [
        "Submit Expression of Interest to RRECL",
        "Obtain land allotment from state government",
        "Sign Power Purchase Agreement (PPA) with DISCOM",
        "Complete project within stipulated timeline",
        "Avail wheeling charge waiver on commissioning",
      ],
      documents: ["Company Registration", "Project DPR", "Land Documents", "Financial Closure Proof"],
    },
  },
];

type Scheme = typeof schemes[0];

export function Schemes() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Scheme | null>(null);

  const visible = filter === "All" ? schemes : schemes.filter((s) => s.state === filter);

  return (
    <section id="schemes" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block rounded-full glass-premium px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-eco"
          >
            🇮🇳 Government Schemes
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl md:text-5xl font-bold leading-tight"
          >
            Subsidies that <span className="text-gradient-solar">save lakhs</span>
          </motion.h2>
        </motion.div>

        {/* Filter buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12 p-4 glass-premium rounded-2xl w-fit mx-auto"
        >
          {ALL_STATES.map((s) => (
            <motion.button
              key={s}
              onClick={() => setFilter(s)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                filter === s
                  ? "bg-gradient-solar text-primary-foreground shadow-glow scale-105"
                  : "glass-premium-dark hover:border-solar/50 text-foreground/80 hover:text-foreground"
              }`}
            >
              {s}
            </motion.button>
          ))}
        </motion.div>

        {/* Scheme cards */}
        <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((s, i) => (
            <motion.article
              key={s.title}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass-premium rounded-3xl p-7 hover-lift relative overflow-hidden group cursor-pointer"
            >
              <motion.div
                className="absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-0 blur-3xl group-hover:opacity-40 transition-opacity"
                style={{ background: s.color }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-eco/15 px-3 py-1.5 text-xs font-semibold text-eco"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    {s.eligibility}
                  </motion.span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-border/50 text-xs text-muted-foreground font-medium">
                    {s.state}
                  </span>
                </div>

                <h3 className="text-lg font-bold leading-snug group-hover:text-solar-glow transition-colors">
                  {s.title}
                </h3>

                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>

                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => setSelected(s)}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-solar-glow hover:gap-2 transition-all group-hover:scale-105"
                >
                  Learn More <ArrowUpRight className="h-4 w-4" />
                </motion.button>
              </div>

              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  boxShadow: `inset 0 0 20px color-mix(in oklab, ${s.color.split("(")[1]} 20%, transparent)`,
                }}
              />
            </motion.article>
          ))}
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
            >
              {/* Close */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                  <BadgeCheck className="h-4 w-4" /> {selected.eligibility}
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-500 font-medium">
                  {selected.state}
                </span>
              </div>

              <h2 className="text-xl font-bold mt-3 mb-5 pr-8 text-gray-900">{selected.title}</h2>

              {/* Key info */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-xs text-orange-500 uppercase tracking-wider mb-1 font-semibold">
                    <IndianRupee className="h-3.5 w-3.5" /> Subsidy
                  </div>
                  <div className="text-sm font-bold text-orange-600">{selected.details.subsidy}</div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <div className="text-xs text-blue-500 uppercase tracking-wider mb-1 font-semibold">Capacity</div>
                  <div className="text-sm font-bold text-blue-700">{selected.details.capacity}</div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 col-span-2">
                  <div className="text-xs text-green-600 uppercase tracking-wider mb-1 font-semibold">Key Benefit</div>
                  <div className="text-sm font-semibold text-green-700">{selected.details.benefit}</div>
                </div>
              </div>

              {/* How to apply */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-800">
                  <CheckCircle className="h-4 w-4 text-orange-500" /> How to Apply
                </div>
                <ol className="space-y-2">
                  {selected.details.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-600">
                      <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-800">
                  <FileText className="h-4 w-4 text-orange-500" /> Documents Required
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.details.documents.map((doc) => (
                    <span key={doc} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <a
                href={selected.details.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-solar text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Apply on Official Portal <ExternalLink className="h-4 w-4" />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
