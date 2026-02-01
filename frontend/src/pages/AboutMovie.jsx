import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { Play, ExternalLink, BookOpen, Star, Volume2, VolumeX, Eye, Check, X } from "lucide-react";
import Loader, { PageLoader } from "../components/Loader";
import { useOpenLink } from "../hooks/useOpenLink";
import SaveMovie from "../components/SaveMovie";
import ShareMovieButton from "../components/ShareMovieButton";
import LikeMovie from "../components/LikeMovie";
import Comments from "@/components/Comments";
import nProgress from "nprogress";
import { useUser } from "@/context/UserContext";
import StarRating from "@/components/StarRating";
import { toast } from "react-toastify";

const AboutMovie = () => {
  const { imdbID } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [watchPlatforms, setWatchPlatforms] = useState([]);
  const { userId } = useUser();
  const [watched, setWatched] = useState(false);
  const [watchEntry, setWatchEntry] = useState(null);
  const [showWatchModal, setShowWatchModal] = useState(false);
  const [watchRating, setWatchRating] = useState(null);
  const [watchReview, setWatchReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [trailerVideoId, setTrailerVideoId] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (imdbID) {
      fetchMovieDetails();
      checkWatchStatus();
    }
  }, [imdbID]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowTrailer(false);
    };
    if (showTrailer) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [showTrailer]);

  const fetchMovieDetails = async () => {
    nProgress.start();
    setLoading(true);
    try {
      const response = await axios.get(`/api/movie_details?imdbID=${imdbID}`);
      setMovieDetails(response.data);
      await whereToWatch(response.data.Title);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      setLoading(false);
      nProgress.done();
    }
  };

  const checkWatchStatus = async () => {
    try {
      const res = await axios.get(`/api/watch-history/check/${imdbID}`, {
        withCredentials: true,
      });
      setWatched(res.data.watched);
      setWatchEntry(res.data.entry);
      if (res.data.entry) {
        setWatchRating(res.data.entry.rating);
        setWatchReview(res.data.entry.review || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsWatched = async () => {
    if (!userId) {
      toast.error("Please login to track movies");
      return;
    }
    setShowWatchModal(true);
  };

  const submitWatch = async () => {
    try {
      setSubmitting(true);
      nProgress.start();
      await axios.post(
        "/api/watch-history/add",
        {
          movieId: imdbID,
          movieTitle: movieDetails.Title,
          moviePoster: movieDetails.Poster,
          rating: watchRating,
          review: watchReview,
          watchedAt: new Date().toISOString(),
        },
        { withCredentials: true }
      );
      setWatched(true);
      setShowWatchModal(false);
      toast.success("Added to your watch history!");
      checkWatchStatus();
    } catch (err) {
      toast.error("Failed to add to watch history");
    } finally {
      setSubmitting(false);
      nProgress.done();
    }
  };

  const handleReadPlot = () => {
    if (!isPlaying) {
      const utterance = new SpeechSynthesisUtterance(movieDetails.Plot);
      speechSynthesis.speak(utterance);
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
    } else {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const fetchTrailerVideoId = async (movieTitle) => {
    if (trailerVideoId) {
      setShowTrailer(!showTrailer);
      return;
    }
    setTrailerLoading(true);
    try {
      const response = await axios.post(`/api/get-trailer-id`, {
        movieTitle: movieTitle,
      });
      setTrailerVideoId(response.data);
      setShowTrailer(true);
    } catch (error) {
      toast.error("Trailer not found");
    } finally {
      setTrailerLoading(false);
    }
  };

  const goToImdb = async (movieId) => {
    const openLink = useOpenLink();
    const newTab = openLink("/loading", "_blank");
    try {
      const response = await axios.post(`/api/get-imdb-url`, {
        movieTitle: movieId,
      });
      const imdbUrl = response.data;
      if (imdbUrl && newTab) {
        newTab.location.href = imdbUrl;
      }
    } catch (error) {
      console.log(error);
      newTab.close();
    }
  };

  const whereToWatch = async (movieTitle) => {
    try {
      const response = await axios.post(`/api/where-to-watch`, {
        movieTitle: movieTitle,
      });
      let data = response.data;
      if (typeof data === "string") {
        data = data.replace(/'/g, '"');
        data = JSON.parse(data);
      }
      if (Array.isArray(data)) {
        setWatchPlatforms(data);
      } else {
        setWatchPlatforms([]);
      }
    } catch (error) {
      console.log(error);
      setWatchPlatforms([]);
    }
  };

  const goToWiki = async (movieTitle) => {
    const openLink = useOpenLink();
    const newTab = openLink("/loading", "_blank");
    try {
      const response = await axios.post(`/api/get-wiki-url`, {
        movieTitle: movieTitle,
      });
      const wikiUrl = response.data;
      if (wikiUrl && newTab) {
        newTab.location.href = wikiUrl;
      }
    } catch (error) {
      newTab.close();
      console.log(error);
    }
  };

  const getReviews = async (movieTitle) => {
    const openLink = useOpenLink();
    const newTab = openLink("/loading", "_blank");
    try {
      const response = await axios.post(`/api/get-reviews-url`, {
        movieTitle: movieTitle,
      });
      const reviewUrl = response.data;
      if (reviewUrl && newTab) {
        newTab.location.href = reviewUrl;
      }
    } catch (error) {
      newTab.close();
      console.error("Failed to get Rotten Tomatoes URL:", error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return <PageLoader message="Loading movie details..." />;
  }

  if (!movieDetails) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[60vh]"
      >
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No movie selected or details unavailable.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-5xl mx-auto px-4 py-8"
    >
      <motion.h1
        variants={itemVariants}
        className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
      >
        {movieDetails.Title}
      </motion.h1>

      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <motion.div
            variants={itemVariants}
            className="flex justify-center md:col-span-1"
          >
            <img
              className="rounded-xl shadow-lg max-w-full h-auto object-cover"
              src={movieDetails.Poster}
              alt={movieDetails.Title}
            />
          </motion.div>

          <div className="md:col-span-2 space-y-6">
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
              {movieDetails.Year && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium">
                  {movieDetails.Year}
                </span>
              )}
              {movieDetails.Runtime && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium">
                  {movieDetails.Runtime}
                </span>
              )}
              {movieDetails.imdbRating && (
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-4 h-4" /> {movieDetails.imdbRating}
                </span>
              )}
              {watched && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" /> Watched
                  {watchEntry?.rating && ` • ★${watchEntry.rating}`}
                </span>
              )}
            </motion.div>

            {Array.isArray(watchPlatforms) && watchPlatforms.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Where to Watch
                </h3>
                <div className="flex flex-wrap gap-2">
                  {watchPlatforms.map((platform, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white dark:bg-gray-600 rounded-lg text-sm font-medium shadow-sm"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {movieDetails.Plot}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReadPlot}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isPlaying ? "Stop Reading" : "Read Aloud"}
              </motion.button>
            </motion.div>
          </div>
        </div>

        <motion.div
          variants={itemVariants}
          className="px-6 pb-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMarkAsWatched}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${watched
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
            >
              <Eye className="w-4 h-4" />
              {watched ? "Watched" : "Mark Watched"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fetchTrailerVideoId(movieDetails.Title)}
              disabled={trailerLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              <Play className="w-4 h-4" /> {trailerLoading ? "Loading..." : showTrailer ? "Hide Trailer" : "Trailer"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => goToImdb(movieDetails.imdbID)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Star className="w-4 h-4" /> IMDb
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => goToWiki(movieDetails.Title)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-xl text-sm font-medium transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Wiki
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => getReviews(movieDetails.Title)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Reviews
            </motion.button>

            <ShareMovieButton movieTitle={movieDetails.Title} />
            <SaveMovie userId={userId} movie={movieDetails} />
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showTrailer && trailerVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl"
            >
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute -top-12 right-0 flex items-center gap-2 text-white hover:text-red-400 transition-colors text-sm font-medium"
              >
                <X className="w-5 h-5" /> Close
              </button>
              <div className="relative w-full pt-[56.25%] rounded-2xl overflow-hidden bg-black shadow-2xl">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${trailerVideoId}?autoplay=1`}
                  title="Movie Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="text-center text-gray-400 text-sm mt-4">Press ESC or click outside to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="mt-8 space-y-6">
        <LikeMovie movieId={movieDetails.imdbID} />
        <Comments movieId={movieDetails.imdbID} />
      </motion.div>

      <AnimatePresence>
        {showWatchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowWatchModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {watched ? "Update Watch Entry" : "Mark as Watched"}
                </h3>
                <button
                  onClick={() => setShowWatchModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Rating (optional)
                  </label>
                  <StarRating rating={watchRating} setRating={setWatchRating} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quick Review (optional)
                  </label>
                  <textarea
                    value={watchReview}
                    onChange={(e) => setWatchReview(e.target.value)}
                    placeholder="What did you think?"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={submitWatch}
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium disabled:opacity-60"
                >
                  {submitting ? "Saving..." : watched ? "Update" : "Add to Diary"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AboutMovie;

