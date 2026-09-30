import { motion } from "framer-motion";
import GDGHeroVisual from "./gdg-hero-visual";
import { MorphText } from "./morph-text";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex-1 w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 py-4 sm:py-6 pointer-events-none select-none max-w-5xl mx-auto"
    >
      {/* ── Eyebrow Label ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mb-2 sm:mb-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4] animate-pulse" />
        <span className="text-[10px] sm:text-xs font-semibold tracking-[0.26em] text-neutral-400 uppercase">
          GOOGLE DEVELOPER GROUPS
        </span>
      </motion.div>

      {/* ── Main Centered Visual (GDG Logo Centerpiece) ── */}
      <div className="w-full my-1 sm:my-2 flex items-center justify-center">
        <GDGHeroVisual />
      </div>

      {/* ── Main Heading (GDG ON CAMPUS - Prominent) ── */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-none mt-1 sm:mt-2"
      >
        GDG ON CAMPUS
      </motion.h1>

      {/* ── Morphing Text (Learn. Build. Grow. - Larger & Styled) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="mt-3 sm:mt-4 flex items-center justify-center"
      >
        <MorphText
          words={["Learn", "Build", "Grow"]}
          interval={2600}
          fontSize="clamp(2.2rem, 5.5vw, 3.8rem)"
          textClassName="text-white font-extrabold tracking-wide drop-shadow-[0_0_30px_rgba(66,133,244,0.45)]"
        />
      </motion.div>
    </section>
  );
}