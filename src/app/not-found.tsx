import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold gradient-text mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium text-sm hover:opacity-90"
          >
            <Home size={16} /> Go Home
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50"
          >
            <Search size={16} /> Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
}
