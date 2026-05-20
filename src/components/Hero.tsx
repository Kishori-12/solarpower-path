import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Sun, Leaf, Zap, Battery, ChevronDown } from "lucide-react";
import heroImg from "@/assets/hero-solar.jpg";

const floats = [
  { Icon: Sun, top: "12%", left: "8%", delay: 0 },
  { Icon: Leaf, top: "70%", left: "5%", delay: 1.2 },
  { Icon: Zap, top: "20%", left: "88%", delay: 0.6 },
  { Icon: Battery, top: "75%", left: "85%", delay: 1.8 },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-12"
    >
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Solar panels glowing at sunset"
          className="h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        {/* Strong dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Subtle warm tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/40 via-black/20 to-black/50" />
        {/* Bottom fade to page background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      {/* Floating icons */}
      {floats.map(({ Icon, top, left, delay }, i) => (
        <motion.div
          key={i}
          className="absolute hidden md:flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
          style={{ top, left }}
          animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
          whileHover={{ scale: 1.1 }}
        >
          <Icon className="h-6 w-6 text-white" />
        </motion.div>
      ))}

      {/* Sun glow blob */}
      <motion.div
        className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full blur-3xl opacity-30 -z-10"
        style={{ background: "radial-gradient(circle, oklch(0.78 0.18 60), transparent)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 w-full">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-4 py-2 rounded-full w-fit"
            >
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-semibold text-white">India's #1 Solar Platform</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white drop-shadow-lg"
            >
              <span className="block">Smart Solar</span>
              <span className="text-gradient-solar">Decision Platform</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-white/85 max-w-xl leading-relaxed drop-shadow"
            >
              Calculate solar savings, explore government schemes, compare vendors, and maximize
              your ROI — all in one intelligent platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <motion.a
                href="#calculator"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-solar text-primary-foreground font-semibold shadow-glow hover:shadow-xl transition-all"
              >
                Calculate Savings
                <ArrowRight className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#schemes"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white font-semibold hover:bg-white/25 transition-all"
              >
                Explore Schemes
                <ArrowRight className="h-5 w-5" />
              </motion.a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-6 text-sm text-white/75 pt-2"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full bg-gradient-solar border-2 border-white/30 shadow"
                    />
                  ))}
                </div>
                <span className="font-semibold text-white">50K+ Users</span>
              </div>
              <span className="text-white/40">•</span>
              <span className="font-semibold text-white">₹100Cr+ Saved</span>
            </motion.div>
          </motion.div>

          {/* Right side visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative hidden lg:flex h-96 items-center justify-center"
          >
            <div className="relative w-full h-full max-w-md">
              <motion.div
                className="absolute inset-0 rounded-3xl bg-gradient-solar blur-2xl opacity-20"
                animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="relative w-full h-full rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-8 flex items-center justify-center overflow-hidden"
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
                <motion.div
                  className="relative z-10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sun className="h-32 w-32 text-yellow-300 drop-shadow-[0_0_30px_rgba(255,200,0,0.6)]" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.a
            href="#features"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <span className="hidden sm:inline">Scroll to explore</span>
            <ChevronDown className="h-5 w-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
