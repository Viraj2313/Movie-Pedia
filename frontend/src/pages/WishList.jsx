import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Trash2, Film } from "lucide-react";
import Loader, { PageLoader } from "../components/Loader";
import LoginRequired from "@/components/LoginRequired";
import { useUser } from "@/context/UserContext";
import nProgress from "nprogress";
import { toast } from "react-toastify";

const WishList = ({ setSelectedMovie }) => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { userId } = useUser();

  const getWishlist = async () => {
    try {
      nProgress.start();
      const response = await axios.get(`/api/wishlist`, {
        withCredentials: true,
      });
      setWishlist(response.data);
    } catch (error) {
      nProgress.done();
      setError(error.message);
    } finally {
      setLoading(false);
      nProgress.done();
    }
  };

  useEffect(() => {
    getWishlist();
  }, []);

  const handleRemove = async (movie) => {
    try {
      nProgress.start();
      const movieToDel = { movieId: movie.movieId };
      const response = await axios.delete(`/api/remove`, {
        data: movieToDel,
        withCredentials: true,
      });

      if (response.status === 200) {
        toast.success("Movie removed from wishlist");
        getWishlist();
        nProgress.done();
      }
    } catch (error) {
      toast.error("Unable to remove movie from wishlist");
      console.log(error);
      nProgress.done();
    }
  };

  const handleClick = (movie) => {
    setSelectedMovie(movie.movieId);
    navigate(`/about/${movie.movieTitle}/${movie.movieId}`);
  };

  if (!userId) {
    return <LoginRequired />;
  }

  if (loading) {
    return <PageLoader message="Loading your watchlist..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 py-8"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
      >
        Your WatchList
      </motion.h1>

      {wishlist && wishlist.length > 0 ? (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 list-none"
        >
          <AnimatePresence mode="popLayout">
            {wishlist.map((item, index) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative cursor-pointer overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-lg group"
              >
                <div
                  className="relative overflow-hidden aspect-[2/3]"
                  onClick={() => handleClick(item)}
                >
                  <motion.img
                    src={item.moviePoster}
                    alt={item.movieTitle}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-white font-semibold text-base leading-tight mb-3 line-clamp-2 drop-shadow-lg">
                    {item.movieTitle}
                  </h3>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </motion.button>
                </div>

                <div className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-orange-500/30 transition-colors pointer-events-none" />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[50vh]"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center mb-6"
          >
            <Film className="w-10 h-10 text-orange-500" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Your watchlist is empty
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
            Start adding movies to your watchlist to keep track of what you want to watch
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WishList;
