import { useToast } from "@/hooks/use-toast";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-0 right-0 z-[9999] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col md:max-w-[420px] pointer-events-none gap-2.5"
    >
      {toasts.map((item) => {
        const { id, title, description, variant = "default", open } = item;

        let icon = <Info className="h-5 w-5 text-[#4285f4] shrink-0" />;
        let borderColor = "border-white/15";
        let glowShadow = "shadow-[0_8px_30px_rgba(0,0,0,0.6)]";

        if (variant === "destructive") {
          icon = <AlertCircle className="h-5 w-5 text-[#ea4335] shrink-0" />;
          borderColor = "border-[#ea4335]/30";
          glowShadow = "shadow-[0_8px_30px_rgba(234,67,53,0.15)]";
        } else if (variant === "success") {
          icon = <CheckCircle2 className="h-5 w-5 text-[#34a853] shrink-0" />;
          borderColor = "border-[#34a853]/30";
          glowShadow = "shadow-[0_8px_30px_rgba(52,168,83,0.15)]";
        }

        return (
          <div
            key={id}
            role="alert"
            className={cn(
              "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border bg-[#101422] p-4 text-white transition-all duration-300",
              borderColor,
              glowShadow,
              open
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-2 opacity-0 scale-95"
            )}
          >
            {icon}
            <div className="flex-1 min-w-0">
              {title && (
                <div className="text-sm font-semibold text-white leading-snug">
                  {title}
                </div>
              )}
              {description && (
                <div className="mt-0.5 text-xs text-neutral-300 leading-relaxed">
                  {description}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(id)}
              aria-label="Close notification"
              className="rounded-md p-1 text-neutral-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Toaster;
