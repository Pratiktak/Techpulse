import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

export type FaqItem = { q: string; a: string };

type Props = {
  items: FaqItem[];
  /** Index of the row to open by default (set to -1 to start fully collapsed). */
  defaultOpen?: number;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function FaqAccordion({ items, defaultOpen = 0 }: Props) {
  const [open, setOpen] = useState<number | null>(
    defaultOpen >= 0 ? defaultOpen : null,
  );

  return (
    <div className="divide-y divide-border/60 border-t border-b border-border/60">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.6,
              ease: EASE,
              delay: Math.min(i * 0.07, 0.35),
            }}
            className="relative"
          >
            {/* Soft hover wash that slides in from the left */}
            <motion.div
              aria-hidden
              initial={false}
              animate={{ opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-primary"
            />

            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-5 pl-4 pr-1 text-left group"
              aria-expanded={isOpen}
            >
              <motion.span
                animate={{ x: isOpen ? 4 : 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="font-serif text-lg lg:text-xl font-medium group-hover:text-primary"
                style={{ transitionProperty: "color", transitionDuration: "300ms" }}
              >
                {item.q}
              </motion.span>

              <motion.span
                animate={{
                  rotate: isOpen ? 135 : 0,
                  borderColor: isOpen
                    ? "hsl(var(--primary))"
                    : "hsl(var(--border))",
                  backgroundColor: isOpen
                    ? "hsl(var(--primary) / 0.08)"
                    : "hsl(var(--background) / 0)",
                }}
                transition={{ duration: 0.5, ease: EASE }}
                className="h-9 w-9 rounded-full border flex items-center justify-center shrink-0"
              >
                <Plus className="h-4 w-4" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: 0.5, ease: EASE },
                    opacity: { duration: 0.35, ease: "easeOut" },
                  }}
                  className="overflow-hidden"
                >
                  <motion.p
                    initial={{ y: -8, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -8, opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}
                    className="text-sm text-muted-foreground leading-relaxed pb-6 pl-4 max-w-2xl"
                  >
                    {item.a}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
