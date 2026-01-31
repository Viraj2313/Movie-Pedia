import { motion } from "framer-motion";
import SaveMovie from "./SaveMovie";
import { useUser } from "@/context/UserContext";

const MovieCard = ({ movie, onClick, index = 0 }) => {
  const { userId } = useUser();

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

      <div className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-orange-500/30 transition-colors duration-300" />
    </motion.li>
  );
};

export default MovieCard;
