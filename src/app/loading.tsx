export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] gap-4">
      <div className="w-12 h-12 border-4 border-gold-primary/30 border-t-gold-primary rounded-full animate-spin" />
      <p className="text-sm font-semibold tracking-widest uppercase text-gold-primary animate-pulse">
        Gold Price Tracker
      </p>
    </div>
  );
}
