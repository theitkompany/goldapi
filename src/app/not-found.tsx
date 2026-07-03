export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="max-w-md rounded-[28px] border border-white/10 bg-white/5 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.34em] text-muted">Page not found</p>
        <h1 className="mt-4 text-3xl font-semibold">404</h1>
        <p className="mt-2 text-sm text-muted">The page you’re looking for does not exist.</p>
      </div>
    </div>
  );
}
