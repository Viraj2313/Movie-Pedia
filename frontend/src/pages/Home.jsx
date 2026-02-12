import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, X, Film, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import Loader, { PageLoader } from "../components/Loader";
import { useUser } from "../context/UserContext";
import InternalServerError from "@/components/ServerError";
import nProgress from "nprogress";
import MovieCard from "../components/MovieCard";

const TYPE_OPTIONS = [
  { label: "All", value: "" },
  { label: "Movies", value: "movie" },
  { label: "Series", value: "series" },
];

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Title A-Z", value: "title-asc" },
  { label: "Title Z-A", value: "title-desc" },
  { label: "Year ↑", value: "year-asc" },
  { label: "Year ↓", value: "year-desc" },
];

const Home = ({ setSelectedMovie }) => {
  const { userId, setUserId } = useUser();
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movieSearch, setSearchMovie] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [yearInput, setYearInput] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const isInitialLoad = useRef(true);
  const yearDebounceRef = useRef(null);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const getUserIdFromToken = async () => {
    try {
      const response = await axios.get("/api/get-user-id", {
        withCredentials: true,
      });
      if (response.status === 200) {
        setUserId(response.data.userId);
      }
    } catch (error) {
      console.error("Failed to get user ID:", error);
    }
  };

  useEffect(() => {
    if (yearDebounceRef.current) clearTimeout(yearDebounceRef.current);
    yearDebounceRef.current = setTimeout(() => {
      setYearFilter(yearInput);
    }, 800);
    return () => clearTimeout(yearDebounceRef.current);
  }, [yearInput]);

  useEffect(() => {
    if (isInitialLoad.current) {
      setLoading(true);
    }
    nProgress.start();
    getUserIdFromToken();

    const params = {};
    if (typeFilter) params.type = typeFilter;
    if (yearFilter) params.year = yearFilter;

    axios
      .get("/api/home", { params })
      .then((response) => {
        setMovies(response.data || []);
        setSearchResults(response.data || []);
        setLoading(false);
        isInitialLoad.current = false;
        nProgress.done();
      })
      .catch((error) => {
        console.error(error);
        setServerError(true);
        setError("Unable to fetch movies from server");
        setLoading(false);
        isInitialLoad.current = false;
        setMovies([]);
        setSearchResults([]);
        nProgress.done();
      });
  }, [typeFilter, yearFilter]);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!movieSearch.trim()) {
      setSearchResults([...movies]);
      setSearchLoading(false);
      return;
    }

    abortControllerRef.current = new AbortController();
    setSearchLoading(true);

    const searchWords = movieSearch.toLowerCase().split(" ");
    const filteredMovies = movies.filter((movie) =>
      searchWords.every((word) => movie.Title.toLowerCase().includes(word))
    );

    if (filteredMovies.length > 0) {
      setSearchResults(filteredMovies);
      setSearchLoading(false);
    } else {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (yearFilter) params.year = yearFilter;

      axios
        .get(`/api/home/search-movie/${movieSearch}`, {
          signal: abortControllerRef.current.signal,
          params,
        })
        .then((response) => {
          setSearchResults(response.data.Search || []);
          setSearchLoading(false);
        })
        .catch((error) => {
          if (error.name === "AbortError") {
            console.log("Search request aborted");
          } else {
            console.error("Error fetching search results:", error);
            setSearchResults([]);
            setSearchLoading(false);
          }
        });
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [movieSearch, movies, typeFilter, yearFilter]);

  const sortedResults = useMemo(() => {
    if (sortBy === "default") return searchResults;
    return [...searchResults].sort((a, b) => {
      const titleA = (a.Title || "").toLowerCase();
      const titleB = (b.Title || "").toLowerCase();
      const yearA = parseInt(a.Year) || 0;
      const yearB = parseInt(b.Year) || 0;
      switch (sortBy) {
        case "title-asc": return titleA.localeCompare(titleB);
        case "title-desc": return titleB.localeCompare(titleA);
        case "year-asc": return yearA - yearB;
        case "year-desc": return yearB - yearA;
        default: return 0;
      }
    });
  }, [searchResults, sortBy]);

  const activeFilterCount = (typeFilter ? 1 : 0) + (yearInput ? 1 : 0) + (sortBy !== "default" ? 1 : 0);

  const handleClick = (movie) => {
    setSelectedMovie(movie.imdbID);
    navigate(`/about/${movie.Title}/${movie.imdbID}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchMovie(movieSearch.trim());
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchMovie(value);
    if (!value.trim()) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setSearchResults([...movies]);
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSearchMovie("");
    setSearchResults([...movies]);
    setSearchLoading(false);
    searchInputRef.current?.focus();
  };

  if (loading) {
    return <PageLoader message="Loading movies..." />;
  }

  return (
    <div className="min-h-screen dark:text-gray-100 dark:bg-gray-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />

        <div className="relative px-4 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-purple-600 bg-clip-text text-transparent">
                Moviepedia
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
            >
              Search movies, check ratings, read plot summaries, and discover
              your next favorite film
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              onSubmit={handleSearchSubmit}
              className="max-w-2xl mx-auto"
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={movieSearch}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-28 py-4 text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all duration-300"
                  placeholder="Search for movies..."
                  autoFocus
                />

                <AnimatePresence>
                  {movieSearch && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      type="button"
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-24 flex items-center pr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="absolute inset-y-2 right-2 flex items-center px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-medium shadow-lg shadow-orange-500/25 transition-all duration-300"
                >
                  Search
                </motion.button>
              </div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="mt-6 flex justify-center"
            >
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-orange-500 transition-all"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters & Sort
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full min-w-[20px] text-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </motion.div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        Type
                      </p>
                      <div className="flex gap-2">
                        {TYPE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setTypeFilter(opt.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${typeFilter === opt.value
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Year
                        </p>
                        <input
                          type="number"
                          min="1900"
                          max="2030"
                          value={yearInput}
                          onChange={(e) => setYearInput(e.target.value)}
                          placeholder="e.g. 2024"
                          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl border-2 border-transparent focus:border-orange-500 outline-none transition-all text-sm"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Sort By
                        </p>
                        <div className="relative">
                          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl border-2 border-transparent focus:border-orange-500 outline-none transition-all text-sm appearance-none cursor-pointer"
                          >
                            {SORT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => {
                          setTypeFilter("");
                          setYearInput("");
                          setYearFilter("");
                          setSortBy("default");
                        }}
                        className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {serverError ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center min-h-[400px]"
          >
            <InternalServerError />
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              {movieSearch && !searchLoading && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-8 text-center"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {searchResults.length > 0
                      ? `Found ${searchResults.length} results for "${movieSearch}"`
                      : `No results found for "${movieSearch}"`}
                  </h2>
                  {searchResults.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400">
                      Try different keywords or check spelling
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {searchLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader message="Searching movies..." />
              </div>
            ) : (
              <>
                {sortedResults.length > 0 ? (
                  <div className="max-w-7xl mx-auto">
                    <motion.ul
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 list-none"
                    >
                      {sortedResults.map((movie, index) => (
                        <MovieCard
                          key={movie.imdbID || index}
                          movie={movie}
                          onClick={handleClick}
                          index={index}
                        />
                      ))}
                    </motion.ul>
                  </div>
                ) : (
                  !movieSearch && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-16"
                    >
                      <div className="max-w-md mx-auto">
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center"
                        >
                          <Film className="w-10 h-10 text-orange-500" />
                        </motion.div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Start Your Movie Journey
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Use the search bar above to discover amazing movies
                        </p>
                      </div>
                    </motion.div>
                  )
                )}
              </>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {movieSearch && sortedResults.length > 0 && !searchLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700 z-10"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {sortedResults.length} movies
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
