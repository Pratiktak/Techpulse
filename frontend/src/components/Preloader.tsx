import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const BRAND = "TechPulse";

export function Preloader() {
  // Run on every fresh page load (initial mount, hard refresh, Cmd/Ctrl+R).
  // No sessionStorage gate — soft client-side route changes don't remount
  // App.tsx, so this still won't fire on internal navigation.
  const [show, setShow] = useState<boolean>(true);

  useEffect(() => {
    if (!show) return;
    // Lock body scroll while the preloader is up so the hero never peeks out.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = window.setTimeout(() => setShow(false), 2200);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, [show]);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            filter: "blur(12px)",
            transition: { duration: 0.9, ease: [0.65, 0, 0.35, 1] },
          }}
        >
          {/* Subtle radial wash so the dark/light backgrounds feel less flat */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, hsl(var(--primary) / 0.08), transparent 55%)",
            }}
          />
          {/* Faint grain for that premium print-like texture */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            }}
          />

          <div className="relative flex flex-col items-center">
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 text-[10px] sm:text-xs uppercase tracking-[0.4em] text-muted-foreground"
            >
              — Welcome
            </motion.p>

            {/* Letter-by-letter brand reveal in the Fraunces serif */}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light tracking-tight flex overflow-hidden">
              {BRAND.split("").map((char, i) => (
                <motion.span
                  key={`${char}-${i}`}
                  initial={{ y: "110%", opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                  transition={{
                    delay: 0.25 + i * 0.06,
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
              <motion.span
                aria-hidden
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.95, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="ml-1 self-end pb-3 italic text-primary"
              >
                .
              </motion.span>
            </h1>

            {/* Progress line */}
            <div className="mt-10 h-px w-44 sm:w-56 overflow-hidden bg-border">
              <motion.div
                className="h-full origin-left bg-foreground"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 0.45,
                  duration: 1.5,
                  ease: [0.65, 0, 0.35, 1],
                }}
                style={{ transformOrigin: "left center" }}
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="mt-5 text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
            >
              Curating tech, beautifully
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
