import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Wheat,
  Info,
  Home,
  Menu,
  X,
  LogOut,
  User,
  Store,
} from "lucide-react";
import { AuthContext } from "./AuthContext";

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const linkClass = (isActive) =>
    `flex items-center gap-2 px-5 py-2 rounded-xl font-medium transition-all duration-200 ${
      isActive
        ? "bg-green-600 text-white shadow-md scale-105"
        : "text-green-800 hover:bg-green-100 hover:text-green-900"
    }`;

  // Close profile dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full sticky top-0 z-30 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 shadow-md">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/team/logo.jpg" alt="Logo" className="h-12 rounded-lg" />
          <div>
            <div className="font-extrabold text-xl text-green-900 flex items-center gap-2">
              KrishiMitra <Wheat className="text-yellow-500 w-5 h-5" />
            </div>
            <div className="text-sm text-green-700">AI Crop Price Portal</div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <NavLink to="/" className={({ isActive }) => linkClass(isActive)}>
            <Home className="w-5 h-5" /> Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => linkClass(isActive)}>
            <Info className="w-5 h-5" /> About
          </NavLink>

          {/* Dealer link only for dealer users */}
          {user?.role === "dealer" && (
            <NavLink
              to="/dealer"
              className={({ isActive }) => linkClass(isActive)}
            >
              <Store className="w-5 h-5" /> Dealer
            </NavLink>
          )}

          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-200 text-green-900 font-semibold shadow-sm hover:bg-green-300 transition"
              >
                <User className="w-4 h-4" /> {user.name}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-green-200 rounded-xl shadow-lg p-4 z-50">
                  <div className="flex flex-col items-center">
                    <img
                      src={user.profilePic || "/team/default-avatar.png"}
                      alt="Profile"
                      className="w-16 h-16 rounded-full border-2 border-green-300 mb-3"
                    />
                    <h3 className="text-lg font-bold text-green-900">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-700">{user.email}</p>
                    <p className="text-sm text-gray-700">{user.contact}</p>
                  </div>

                  <button
                    onClick={logout}
                    className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition shadow-sm"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => linkClass(isActive)}>
                Login
              </NavLink>
              <NavLink to="/signup" className={({ isActive }) => linkClass(isActive)}>
                Sign Up
              </NavLink>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-green-800 text-2xl p-2 rounded-lg hover:bg-green-200 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-xl border-t border-green-200 animate-slideDown">
          <nav className="flex flex-col gap-3 p-4">
            <NavLink
              to="/"
              className={({ isActive }) => linkClass(isActive)}
              onClick={() => setMenuOpen(false)}
            >
              <Home className="w-5 h-5" /> Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => linkClass(isActive)}
              onClick={() => setMenuOpen(false)}
            >
              <Info className="w-5 h-5" /> About
            </NavLink>

            {/* Dealer link only for dealer users */}
            {user?.role === "dealer" && (
              <NavLink
                to="/dealer"
                className={({ isActive }) => linkClass(isActive)}
                onClick={() => setMenuOpen(false)}
              >
                <Store className="w-5 h-5" /> Dealer
              </NavLink>
            )}

            {user ? (
              <div className="border-t border-green-200 pt-3">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-200 text-green-900 font-semibold shadow-sm w-full justify-center"
                >
                  <User className="w-4 h-4" /> {user.name}
                </button>

                {profileOpen && (
                  <div className="mt-2 w-full bg-white border border-green-200 rounded-xl shadow-lg p-4">
                    <div className="flex flex-col items-center">
                      <img
                        src={user.profilePic || "/team/default-avatar.png"}
                        alt="Profile"
                        className="w-16 h-16 rounded-full border-2 border-green-300 mb-3"
                      />
                      <h3 className="text-lg font-bold text-green-900">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-700">{user.email}</p>
                      <p className="text-sm text-gray-700">{user.contact}</p>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition shadow-sm"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) => linkClass(isActive)}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) => linkClass(isActive)}
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
