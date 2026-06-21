import { motion, AnimatePresence } from "framer-motion";
import SaveMovie from "./SaveMovie";
import { useUser } from "@/context/UserContext";
import { useState, useRef, useCallback } from "react";
import axios from "axios";
import { Star } from "lucide-react";

const GENRE_COLORS = {
  Action: "bg-red-500/80",
  Adventure: "bg-orange-500/80",
  Animation: "bg-yellow-500/80",
  Biography: "bg-lime-500/80",
  Comedy: "bg-green-500/80",
  Crime: "bg-teal-500/80",
  Documentary: "bg-cyan-500/80",
  Drama: "bg-blue-500/80",
  Fantasy: "bg-violet-500/80",
  Horror: "bg-rose-700/80",
  Music: "bg-pink-500/80",
  Mystery: "bg-purple-500/80",
  Romance: "bg-pink-400/80",
  "Sci-Fi": "bg-sky-500/80",
  Sport: "bg-emerald-500/80",
  Thriller: "bg-amber-700/80",
  War: "bg-stone-600/80",
  Western: "bg-yellow-700/80",
};

const genreColor = (genre) => GENRE_COLORS[genre] || "bg-gray-500/80";

const MovieCard = ({ movie, onClick, index = 0 }) => {
  const { userId } = useUser();
  const [hovered, setHovered] = useState(false);
  const [details, setDetails] = useState(null);
  const [fetching, setFetching] = useState(false);
  const cacheRef = useRef(null);

  const handleMouseEnter = useCallback(async () => {
    setHovered(true);
    if (cacheRef.current) {
      setDetails(cacheRef.current);
      return;
    }
    setFetching(true);
    try {
      const res = await axios.get(`/api/movie_details?imdbID=${movie.imdbID}`);
      cacheRef.current = res.data;
      setDetails(res.data);
    } catch {
      cacheRef.current = {};
    } finally {
      setFetching(false);
    }
  }, [movie.imdbID]);

  const genres =
    details?.Genre
      ? details.Genre.split(",")
          .map((g) => g.trim())
          .slice(0, 2)
      : [];

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative cursor-pointer overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-lg group"
      onClick={() => onClick(movie)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden aspect-[2/3]">
        <motion.img
          src={movie.Poster}
          alt={movie.Title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </div>
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-0 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 + 0.2 }}
      >
        <h3 className="text-white font-semibold text-lg leading-tight mb-2 line-clamp-2 drop-shadow-lg">
          {movie.Title}
        </h3>

        {movie.Year && (
          <span className="inline-block text-xs text-gray-300 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full mb-2">
            {movie.Year}
          </span>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <SaveMovie movie={movie} userId={userId} />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-x-0 top-0 z-20 m-2 rounded-xl bg-black/75 backdrop-blur-md p-3 flex flex-col gap-2 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            {fetching ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-300">Loading...</span>
              </div>
            ) : (
              <>
                {details?.imdbRating && details.imdbRating !== "N/A" && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold text-yellow-300">
                      {details.imdbRating}
                    </span>
                    <span className="text-xs text-gray-400">/10 IMDb</span>
                  </div>
                )}

                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {genres.map((genre) => (
                      <span
                        key={genre}
                        className={`${genreColor(genre)} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full`}
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-orange-500/30 transition-colors duration-300" />
    </motion.li>
  );
};

export default MovieCard;
