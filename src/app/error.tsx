"use client";
import React, { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global boundary error:", error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] p-6 text-center text-[#F9F9F9] gap-6">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
        <span className="text-3xl">⚠️</span>
      </div>
      <div className="flex flex-col gap-2 max-w-md">
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-sm text-[#B0B0B0] leading-relaxed">
          An unexpected error occurred while loading the application. Please try again.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="rounded-full bg-[#D4AF37] px-6 py-2.5 text-sm font-semibold text-[#111111] transition hover:bg-[#F7C948] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
      >
        Reload
      </button>
    </div>
  );
}
