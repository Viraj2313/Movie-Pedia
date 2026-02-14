import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart, BookOpen, Users, Sparkles, User, LogIn, UserPlus, LogOut, Settings, ChevronDown } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useUser } from "@/context/UserContext";

const NavBar = ({ user, handleLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { authLoading, userId } = useUser();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { to: "/wishlist", label: "WatchList", icon: Heart },
    { to: "/diary", label: "Diary", icon: BookOpen },
    { to: "/friends", label: "Friends", icon: Users },
    { to: "/recommendations", label: "Recommendations", icon: Sparkles },
  ];

  const NavLink = ({ to, label, mobile = false }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={mobile ? toggleMenu : undefined}
        className={`relative text-md font-medium transition-colors duration-300 ${mobile ? "py-3 text-lg" : "hidden md:block"
          } ${isActive
            ? "text-orange-500"
            : "text-gray-700 dark:text-gray-200 hover:text-orange-500"
          }`}
      >
        {label}
        {isActive && !mobile && (
          <motion.div
            layoutId="activeNav"
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange-500 rounded-full"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  const MobileNavLink = ({ to, label, icon: Icon, index }) => {
    const isActive = location.pathname === to;
    return (
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        <Link
          to={to}
          onClick={toggleMenu}
          className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${isActive
            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
            }`}
        >
          <div className={`p-2 rounded-xl ${isActive ? "bg-white/20" : "bg-gray-100 dark:bg-gray-800"}`}>
            <Icon size={20} className={isActive ? "text-white" : "text-orange-500"} />
          </div>
          <span className="text-lg font-medium">{label}</span>
        </Link>
      </motion.div>
    );
  };

  const ProfileDropdown = () => (
    <AnimatePresence>
      {profileDropdown && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
        >
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <Link to={"/profile"}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {user?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{user}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">View your profile</p>
                </div>
              </div></Link>

          </div>

          <div className="p-2">
            <Link
              to="/profile"
              onClick={() => setProfileDropdown(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <User size={18} className="text-gray-500" />
              <span className="text-sm font-medium">Profile</span>
            </Link>

            <Link
              to="/diary"
              onClick={() => setProfileDropdown(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <BookOpen size={18} className="text-gray-500" />
              <span className="text-sm font-medium">My Diary</span>
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setProfileDropdown(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Heart size={18} className="text-gray-500" />
              <span className="text-sm font-medium">Watchlist</span>
            </Link>

            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Theme</span>
              <ThemeToggle />
            </div>
          </div>

          <div className="p-2 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => {
                handleLogout();
                setProfileDropdown(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`sticky top-0 z-50 flex flex-nowrap justify-between items-center px-4 py-3 min-h-16 transition-all duration-300 ${scrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50"
          : "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
          }`}
      >
        <div className="flex items-center gap-4">
          <motion.button
            className="md:hidden focus:outline-none p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={toggleMenu}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {menuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} className="text-orange-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <Link to="/">
            <motion.h2
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Movies
            </motion.h2>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} label={link.label} />
            ))}
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 items-center">
          {authLoading ? (
            <div className="flex gap-2 items-center animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-8 w-8 rounded-full" />
              <div className="bg-gray-200 dark:bg-gray-700 h-8 w-8 rounded-full hidden sm:block" />
            </div>
          ) : userId && user ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full border-2 border-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:border-orange-500 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block max-w-[80px] truncate">
                  {user}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform ${profileDropdown ? "rotate-180" : ""}`}
                />
              </motion.button>
              <ProfileDropdown />
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <Link to="/login" className="hidden sm:block">
                <motion.button
                  className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 border border-orange-300 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Login
                </motion.button>
              </Link>
              <Link to="/signup" className="hidden sm:block">
                <motion.button
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-sm text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Up
                </motion.button>
              </Link>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={toggleMenu}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-gray-900 z-50 md:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                  <Link to="/" onClick={toggleMenu}>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                      Movies
                    </h2>
                  </Link>
                  <motion.button
                    onClick={toggleMenu}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X size={24} className="text-gray-500" />
                  </motion.button>
                </div>

                {userId && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 border-b border-gray-100 dark:border-gray-800"
                  >
                    <Link to="/profile" onClick={toggleMenu} className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/25">
                        <span className="text-xl font-bold text-white">
                          {user.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View Profile</p>
                      </div>
                    </Link>
                  </motion.div>
                )}

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-2">
                    {navLinks.map((link, index) => (
                      <MobileNavLink key={link.to} {...link} index={index} />
                    ))}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
                    <ThemeToggle />
                  </div>

                  {userId && user ? (
                    <motion.button
                      onClick={() => {
                        handleLogout();
                        toggleMenu();
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-4 text-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
                    >
                      Logout
                    </motion.button>
                  ) : (
                    <div className="flex gap-3">
                      <Link to="/login" onClick={toggleMenu} className="flex-1">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3 flex items-center justify-center gap-2 border-2 border-orange-400 text-orange-500 rounded-xl font-medium"
                        >
                          <LogIn size={18} />
                          Login
                        </motion.button>
                      </Link>
                      <Link to="/signup" onClick={toggleMenu} className="flex-1">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/25"
                        >
                          <UserPlus size={18} />
                          Sign Up
                        </motion.button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
