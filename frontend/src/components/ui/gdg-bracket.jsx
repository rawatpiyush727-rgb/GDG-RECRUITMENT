import gdgBracketLeft from "@/assets/gdg-bracket-left.png";
import gdgBracketRight from "@/assets/gdg-bracket-right.png";

/**
 * GDGBracket Component
 * Renders the authentic GDG bracket geometry directly from the official logo asset.
 * 
 * type: "left" | "right"
 * left:  Red (top) + Blue (bottom) bracket (<)
 * right: Green (top) + Yellow (bottom) bracket (>)
 */
export function GDGBracket({ type = "left", className = "", glow = true, style = {} }) {
  const isLeft = type === "left";
  const src = isLeft ? gdgBracketLeft : gdgBracketRight;
  const alt = isLeft ? "GDG Left Bracket (<)" : "GDG Right Bracket (>)";

  return (
    <div
      style={style}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
    >
      {/* Subtle localized glow matching the bracket colors */}
      {glow && (
        <div
          className={`absolute inset-0 rounded-full blur-xl pointer-events-none opacity-40 transition-opacity duration-300 ${
            isLeft
              ? "bg-gradient-to-b from-[#EA4335]/40 to-[#4285F4]/40"
              : "bg-gradient-to-b from-[#34A853]/40 to-[#FBBC05]/40"
          }`}
        />
      )}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="relative z-10 w-full h-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]"
      />
    </div>
  );
}

export default GDGBracket;
