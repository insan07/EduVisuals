import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="text-[120px] leading-none mb-4">🔍</div>
      <h1 className="text-8xl font-black text-brand mb-4">404</h1>
      <h2 className="text-3xl font-extrabold text-brand mb-3">Page not found</h2>
      <p className="text-brand-faint max-w-md mx-auto mb-8 text-sm md:text-base">
        The visual you're looking for doesn't exist or has been removed.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/" className="px-6 py-3 rounded-xl border border-brand-border bg-white text-brand font-bold hover:bg-brand-surface transition-colors shadow-sm">
          Go Home
        </Link>
        <Link href="/visuals" className="px-6 py-3 rounded-xl bg-brand text-white font-bold hover:-translate-y-0.5 transition-all shadow-md">
          Browse Visuals →
        </Link>
      </div>
    </div>
  );
}
