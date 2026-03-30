import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Scan Analysis", to: "/scan" },
  { label: "Symptom Checker", to: "/symptoms" },
  { label: "Medicine Info", to: "/medicine" },
  { label: "Health Chat", to: "/chat" },
  { label: "History", to: "/history" },
];

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `relative px-1 py-2 text-sm transition ${
          isActive ? "text-cyan-300" : "text-gray-300 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <span>
          {label}
          {isActive && <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-cyan-400" />}
        </span>
      )}
    </NavLink>
  );
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/90 bg-gray-950/85 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🩺</span>
          <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-xl font-semibold text-transparent">
            RadiologyAI
          </span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} />
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            to="/scan"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-105"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg border border-gray-700 p-2 text-gray-200 md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-800 bg-gray-950 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                onClick={() => setMenuOpen(false)}
              />
            ))}
            <Link
              to="/scan"
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
