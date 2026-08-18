import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-7xl font-extrabold text-emerald-600">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-stone-800">This road leads nowhere</h1>
      <p className="mt-2 text-stone-500">
        The page you're looking for doesn't exist — maybe it moved, or your companion wandered off.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-5 py-2.5 rounded-xl"
        >
          Back home
        </Link>
        <Link
          href="/search"
          className="bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold px-5 py-2.5 rounded-xl"
        >
          Find a companion
        </Link>
      </div>
    </div>
  );
}