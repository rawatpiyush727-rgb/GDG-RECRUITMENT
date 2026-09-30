import GDGLogoFallback from "./gdg-logo-fallback";

/**
 * GDGHeroVisual Component
 * 
 * Serves as the central visual container for the Hero section.
 * Renders the authentic GDG logo with multi-layer ambient glows and micro-parallax.
 */
export default function GDGHeroVisual({
  fallback = <GDGLogoFallback />,
  className = "",
  children,
}) {
  return (
    <div
      className={`relative w-full max-w-xl mx-auto flex items-center justify-center ${className}`}
    >
      {children || fallback}
    </div>
  );
}


