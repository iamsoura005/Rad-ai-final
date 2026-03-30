import {
  Bot,
  FileClock,
  Home,
  Pill,
  ScanLine,
  Stethoscope,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/scan", label: "Scan Analysis", icon: ScanLine },
  { to: "/symptoms", label: "Symptom Checker", icon: Stethoscope },
  { to: "/medicine", label: "Medicine Info", icon: Pill },
  { to: "/chat", label: "Health Chat", icon: Bot },
  { to: "/history", label: "History", icon: FileClock },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderLinks = (onClick) => (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl border-l-2 px-3 py-2 text-sm transition ${
                isActive
                  ? "border-cyan-400 bg-cyan-500/10 text-cyan-200"
                  : "border-transparent text-gray-300 hover:border-cyan-500/40 hover:bg-gray-800/70"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="mb-4 w-full shrink-0 rounded-2xl border border-gray-800 bg-gray-900/70 p-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-3 py-2 text-sm text-gray-200"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />} Feature Menu
        </button>

        {mobileOpen && <div className="mt-3">{renderLinks(() => setMobileOpen(false))}</div>}
      </aside>

      <aside className="hidden h-fit w-64 shrink-0 rounded-2xl border border-gray-800 bg-gray-900/70 p-3 lg:block">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="mb-2 inline-flex w-full items-center justify-end rounded-lg p-2 text-gray-400 hover:bg-gray-800/70 hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        {renderLinks()}
      </aside>
    </>
  );
}

export default Sidebar;
