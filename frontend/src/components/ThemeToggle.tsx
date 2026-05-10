import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

type DocumentWithViewTransition = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const btnRef = useRef<HTMLButtonElement>(null);

  const current = theme === "system" ? resolvedTheme : theme;
  const next = current === "dark" ? "light" : "dark";

  const enableThemeAnim = () => {
    const root = document.documentElement;
    root.classList.add("theme-anim");
    window.setTimeout(() => root.classList.remove("theme-anim"), 700);
  };

  const toggle = async () => {
    const doc = document as DocumentWithViewTransition;
    const btn = btnRef.current;

    // Pulse the button itself for tactile feedback.
    btn?.animate(
      [
        { transform: "scale(1)", boxShadow: "0 0 0 0 hsl(var(--primary) / 0.5)" },
        { transform: "scale(0.92)", boxShadow: "0 0 0 10px hsl(var(--primary) / 0)" },
        { transform: "scale(1)", boxShadow: "0 0 0 0 hsl(var(--primary) / 0)" },
      ],
      { duration: 500, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );

    // Browsers without View Transitions API → just swap with the global CSS
    // transitions doing the heavy lifting.
    if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      enableThemeAnim();
      setTheme(next);
      return;
    }

    enableThemeAnim();

    // Compute the circle origin from the toggle button's position so the
    // reveal expands out from where the user actually clicked.
    const rect = btn?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
    const y = rect ? rect.top + rect.height / 2 : 40;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = doc.startViewTransition(() => {
      setTheme(next);
    });

    try {
      await transition.ready;
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    } catch {
      /* transition can be skipped if the user double-toggles fast — ignore */
    }
  };

  return (
    <Button
      ref={btnRef}
      variant="ghost"
      size="icon"
      className="rounded-full relative overflow-hidden"
      onClick={toggle}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform duration-500 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform duration-500 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
