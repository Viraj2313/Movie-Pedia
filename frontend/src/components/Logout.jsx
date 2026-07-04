import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Logout = ({ handleLogout }) => {
  return (
    <button
      className="h-10 rounded-2xl text-white cursor-pointer bg-gradient-to-r from-zinc-800 to-zinc-900 dark:from-zinc-200 dark:to-white dark:text-zinc-900 hover:from-zinc-700 hover:to-zinc-800 transition-all duration-300 shadow-lg transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-zinc-900/20 sm:w-32 w-full sm:h-10 px-4"
      onClick={handleLogout}
    >
      Log out
    </button>
  );
};

export default Logout;
