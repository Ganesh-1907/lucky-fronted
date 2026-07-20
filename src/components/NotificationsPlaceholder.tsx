"use client";

// ═══════════════════════════════════════════════════════════════
// Notifications Module — HIDDEN for future implementation
// ═══════════════════════════════════════════════════════════════
// Uncomment the code below when ready to enable notification UI.
// ═══════════════════════════════════════════════════════════════

export default function NotificationsPlaceholder() {
  return null;
}

/* -- FUTURE NOTIFICATION UI --
import { useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationsPlaceholder() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors hidden sm:flex items-center justify-center"
      >
        <Bell size={20} className="text-gray-600" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors sm:hidden flex items-center justify-center"
      >
        <Bell size={18} className="text-gray-600" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all">
            <div className="flex items-center justify-between p-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Notifications</h3>
            </div>
            <div className="p-10 text-center text-gray-500 flex flex-col items-center justify-center">
              <Bell size={32} className="mx-auto mb-4 text-violet-300" />
              <h4 className="text-lg font-bold text-gray-900 mb-1">Coming Soon</h4>
              <p className="text-sm font-medium">The notifications module is under development and will be available soon.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
*/
