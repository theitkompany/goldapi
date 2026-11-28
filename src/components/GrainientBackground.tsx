"use client";

import Grainient from "@/components/Grainient";
import { useTheme } from "@/components/ThemeProvider";

export default function GrainientBackground() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <Grainient
        colors={["#07100a", "#0d1f14", "#1b3a24", "#4d6b28", "#b7f34b"]}
        angle={55}
        flow={0.75}
        speed={0.65}
        silk={0.3}
        grainAmount={0.07}
        grainSize={1.2}
        contrast={0.9}
        saturation={0.85}
        interactive={true}
        stir={0.8}
        clickSwirl={true}
        lightMode={isLight}
        style={{ width: "100%", height: "100%" }}
      />
      <div
        className={`absolute inset-0 transition-colors duration-300 ${
          isLight ? "bg-white/45" : "bg-[#050806]/55"
        }`}
      />
    </div>
  );
}
