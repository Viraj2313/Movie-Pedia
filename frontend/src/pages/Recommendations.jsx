import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Sparkles, Film } from "lucide-react";
import Loader from "@/components/Loader";
import { MovieCardSkeleton } from "@/components/Skeletons";
import SaveMovie from "../components/SaveMovie";
import LoginRequired from "@/components/LoginRequired";
import nProgress from "nprogress";

const Recommendations = ({ setSelectedMovie }) => {
  const { userId } = useUser();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    const fetchRecommendations = async () => {
      try {
        nProgress.start();
        const response = await axios.get(`/recommender-api/${userId}`);
        setRecommendations(response.data.Recommendations);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendations([]);
      } finally {
        setLoading(false);
        nProgress.done();
      }
    };

    fetchRecommendations();
  }, [userId]);

  const handleClick = (movie) => {
    setSelectedMovie(movie.imdbID);
    navigate(`/about/${movie.title}/${movie.imdbID}`);
  };

  if (!userId) {
    return <LoginRequired />;
  }

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="animate-pulse h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-8" />
        <MovieCardSkeleton count={8} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 py-8"
    >

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-orange-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Recommendations
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Movies picked just for you based on your preferences
        </p>
      </motion.div>

      {recommendations.length > 0 ? (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 list-none"
        >
          {recommendations.map((item, index) => (
            <motion.li
              key={item.imdbID}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative cursor-pointer overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-lg group"
              onClick={() => handleClick(item)}
            >

              <div className="relative overflow-hidden aspect-[2/3]">
                <motion.img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />


                <div className="absolute top-2 right-2 px-2 py-1 bg-orange-500/90 backdrop-blur-sm rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-white" />
                  <span className="text-xs text-white font-medium">AI Pick</span>
                </div>
              </div>


              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="text-white font-semibold text-base leading-tight mb-3 line-clamp-2 drop-shadow-lg">
                  {item.title}
                </h3>
                <div onClick={(e) => e.stopPropagation()}>
                  <SaveMovie
                    movie={{
                      imdbID: item.imdbID,
                      Title: item.title,
                      Poster: item.poster,
                    }}
                    userId={userId}
                  />
                </div>
              </div>


              <div className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-orange-500/30 transition-colors pointer-events-none" />
            </motion.li>
          ))}
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
            No recommendations yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
            Start adding movies to your watchlist to get personalized recommendations
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Recommendations;
