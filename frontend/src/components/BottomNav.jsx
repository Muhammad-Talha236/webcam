import { Link, useLocation } from "react-router-dom";

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0b0f17]/90 backdrop-blur-lg border-t border-slate-800/80 flex items-center justify-around px-4 z-50 md:hidden shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      {/* Home Link */}
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 transition-all ${
          location.pathname === "/" ? "text-emerald-400 font-semibold" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <span className="text-lg leading-none">⌂</span>
        <span className="text-[10px] tracking-wider font-mono">Home</span>
      </Link>

      {/* Create Button (Primary Action) */}
      <Link
        to="/create"
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:opacity-90 active:scale-95 transition-all"
      >
        <span className="text-base leading-none">＋</span>
        <span className="font-mono tracking-wider">Create</span>
      </Link>

      {/* Reels / Viewer Link */}
      <Link
        to="/viewer"
        className={`flex flex-col items-center gap-1 transition-all ${
          location.pathname === "/viewer" ? "text-emerald-400 font-semibold" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <span className="text-lg leading-none">▶</span>
        <span className="text-[10px] tracking-wider font-mono">Reels</span>
      </Link>
    </nav>
  );
}

export default BottomNav;