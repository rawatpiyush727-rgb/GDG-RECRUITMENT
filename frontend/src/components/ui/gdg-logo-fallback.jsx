import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import gdgLogo from "@/assets/gdg-logo-cropped.png";

export default function GDGLogoFallback({ className = "" }) {
  // Mouse tracking with smooth spring physics for subtle micro-parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Micro tilt and parallax translations
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7]);
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-5, 5]);

  // Track global window pointer movement non-intrusively
  useEffect(() => {
    const handlePointerMove = (e) => {
      const { innerWidth, innerHeight } = window;
      if (!innerWidth || !innerHeight) return;
      const normX = e.clientX / innerWidth - 0.5;
      const normY = e.clientY / innerHeight - 0.5;
      mouseX.set(normX);
      mouseY.set(normY);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [mouseX, mouseY]);

  return (
    <div
      className={`relative flex items-center justify-center select-none py-2 ${className}`}
      style={{ perspective: 1000 }}
    >
      {/* ── Multi-layered Rich Google-Blue & Quadrant Ambient Glow ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        {/* Layer 1: Focused Core Google-Blue Halo (High luminosity near the logo) */}
        <div
          className="w-56 h-36 sm:w-72 sm:h-44 md:w-80 md:h-48 rounded-full blur-2xl opacity-60 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(66,133,244,0.7) 0%, rgba(66,133,244,0.3) 50%, transparent 75%)",
          }}
        />

        {/* Layer 2: Wide Soft Ambient Atmospheric Glow */}
        <div
          className="w-80 h-52 sm:w-[28rem] sm:h-64 md:w-[32rem] md:h-72 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(66,133,244,0.45) 0%, rgba(66,133,244,0.15) 50%, transparent 75%)",
          }}
        />

        {/* Layer 3: Subtle GDG Quadrant Color Accents (Carefully balanced, NOT rainbow) */}
        {/* Top-Left Red Accent (behind red bracket) */}
        <div
          className="absolute -top-3 -left-4 sm:-top-5 sm:-left-8 w-28 h-28 sm:w-36 sm:h-36 rounded-full blur-2xl opacity-30 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(234,67,53,0.7) 0%, transparent 70%)",
          }}
        />
        {/* Bottom-Left Blue Accent (behind blue bracket) */}
        <div
          className="absolute -bottom-3 -left-4 sm:-bottom-5 sm:-left-8 w-32 h-32 sm:w-40 sm:h-40 rounded-full blur-2xl opacity-45 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(66,133,244,0.8) 0%, transparent 70%)",
          }}
        />
        {/* Top-Right Green Accent (behind green bracket) */}
        <div
          className="absolute -top-3 -right-4 sm:-top-5 sm:-right-8 w-28 h-28 sm:w-36 sm:h-36 rounded-full blur-2xl opacity-30 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(52,168,83,0.7) 0%, transparent 70%)",
          }}
        />
        {/* Bottom-Right Yellow Accent (behind yellow bracket) */}
        <div
          className="absolute -bottom-3 -right-4 sm:-bottom-5 sm:-right-8 w-28 h-28 sm:w-36 sm:h-36 rounded-full blur-2xl opacity-30 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(251,188,5,0.7) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Motion Logo with Floating Levitation and Interactive Tilt ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.9,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          rotateX,
          rotateY,
          x: translateX,
          y: translateY,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 will-change-transform pointer-events-none"
      >
        {/* Ambient gentle vertical levitation loop */}
        <motion.div
          animate={{
            y: [-3, 4, -3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex items-center justify-center"
        >
          <img
            src={gdgLogo}
            alt="Google Developer Groups On Campus Logo"
            draggable={false}
            className="w-48 sm:w-56 md:w-64 lg:w-72 max-w-[70vw] h-auto object-contain transition-all duration-300 drop-shadow-[0_0_18px_rgba(66,133,244,0.75)] drop-shadow-[0_0_36px_rgba(66,133,244,0.35)] drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)]"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
