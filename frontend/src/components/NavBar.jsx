import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logout from "./Logout";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useUser } from "@/context/UserContext";

const NavBar = ({ user, handleLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const { authLoading, userId } = useUser();
  return (
    <>
      <nav className="flex flex-nowrap justify-between items-center p-2 gap-4 min-h-20 sm:h-20 shadow-md dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600">
        <div className="flex items-center gap-4 sm:gap-6">
          <button className="md:hidden focus:outline-none" onClick={toggleMenu}>
            {menuOpen ? (
              <X size={24} className="cursor-pointer hover:text-orange-500" />
            ) : (
              <Menu
                size={24}
                className="cursor-pointer hover:text-orange-500"
              />
            )}
          </button>
          <Link to={"/"}>
            <h2 className="text-2xl sm:text-xl font-bold hover:text-orange-500 transition-colors">
              Movies
            </h2>
          </Link>
          <Link
            to={"/wishlist"}
            className="hidden md:block text-md sm:text-xl font-bold hover:text-orange-500 transition-colors"
          >
            WatchList
          </Link>
          <Link
            to={"/friends"}
            className="hidden md:block text-md sm:text-xl font-bold hover:text-orange-500 transition-colors"
          >
            Friends
          </Link>
          <Link
            to={"/recommendations"}
            className="hidden md:block text-md sm:text-xl font-bold hover:text-orange-500 transition-colors"
          >
            Recommendations
          </Link>
        </div>

        <div className="flex gap-4 items-center">
          {authLoading ? (
            <div className="flex gap-4 items-center animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-5 w-20 rounded sm:w-32"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-8 w-20 rounded-md"></div>
              <div className="opacity-50">
                <ThemeToggle />
              </div>
            </div>
          ) : userId && user ? (
            <>
              <strong className="font-light text-sm sm:text-base">
                Welcome, {user}!
              </strong>
              <Logout handleLogout={handleLogout} />
              <ThemeToggle />
            </>
          ) : (
            <div className="flex gap-2">
              <Link to={"/login"}>
                <button className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-sm font-medium rounded-md shadow-md hover:from-orange-500 hover:to-orange-700 transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer">
                  Login
                </button>
              </Link>
              <Link to={"/signup"}>
                <button className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-600 text-sm text-white font-medium rounded-md shadow-md hover:from-orange-500 hover:to-orange-700 transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer">
                  Sign Up
                </button>
              </Link>
              <ThemeToggle />
            </div>
          )}
        </div>

        {/* drop down menu */}
        <div
          className={`absolute top-20 left-0 bg-white dark:bg-gray-900 w-full md:hidden flex flex-col items-center shadow-md border-b border-gray-300 dark:border-gray-600 
          transition-all duration-300 ease-in-out transform origin-top ${
            menuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
          }`}
        >
          <Link
            to={"/wishlist"}
            className="text-md font-bold hover:text-orange-500 py-2"
            onClick={toggleMenu}
          >
            WatchList
          </Link>
          <Link
            to={"/friends"}
            className="text-md font-bold hover:text-orange-500 py-2"
            onClick={toggleMenu}
          >
            Friends
          </Link>
          <Link
            to={"/recommendations"}
            className="text-md font-bold hover:text-orange-500 py-2"
            onClick={toggleMenu}
          >
            Recommendations
          </Link>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
