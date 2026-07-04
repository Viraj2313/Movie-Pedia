import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Film, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-24 h-24 mx-auto bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6"
        >
          <Film className="w-12 h-12 text-zinc-900 dark:text-white" />
        </motion.div>

        <h1 className="text-6xl font-black text-zinc-900 dark:text-white mb-2">404</h1>
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">
          Lost in the Archives
        </h2>
        
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          The movie or page you're looking for doesn't exist, has been moved, or is currently unavailable.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          <Home className="w-4 h-4" />
          Return to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
