import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../assets/styles/Home.css";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import SaveMovie from "../components/SaveMovie";
import { useUser } from "../context/UserContext";
import LoadingPage from "../components/LoadingPage";
import InternalServerError from "@/components/ServerError";
import nProgress from "nprogress";
import MovieCard from "../components/MovieCard";

const Home = ({ setSelectedMovie }) => {
  const { userId, setUserId } = useUser();
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movieSearch, setSearchMovie] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [serverError, setServerError] = useState(false);
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
    setLoading(true);
    nProgress.start();
    getUserIdFromToken();

    axios
      .get("/api/home")
      .then((response) => {
        setMovies(response.data || []);
        setSearchResults(response.data || []);
        setLoading(false);
        nProgress.done();
      })
      .catch((error) => {
        console.error(error);
        setServerError(true);
        setError("Unable to fetch movies from server");
        setLoading(false);
        setMovies([]);
        setSearchResults([]);
        nProgress.done();
      });
  }, []);

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
      searchWords.every((word) => movie.Title.toLowerCase().includes(word)),
    );

    if (filteredMovies.length > 0) {
      setSearchResults(filteredMovies);
      setSearchLoading(false);
    } else {
      axios
        .get(`/api/home/search-movie/${movieSearch}`, {
          signal: abortControllerRef.current.signal,
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
  }, [movieSearch, movies]);

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

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="min-h-screen dark:text-gray-100 dark:bg-gray-900">
          <div className="relative overflow-hidden bg-gradient-to-r text-white">
            <div className="absolute inset-0"></div>
            <div className="relative px-4 py-16 sm:py-20 lg:py-24">
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-4 text-black dark:text-white">
                  Moviepedia
                </h1>
                <p className="text-xl text-blue-500 mb-8 max-w-2xl mx-auto">
                  Search movies, check ratings, read plot summaries, discover
                  recommendations and everything you need to decide what to
                  watch next
                </p>

                <form
                  onSubmit={handleSearchSubmit}
                  className="max-w-2xl mx-auto"
                >
                  <div className="relative group">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={movieSearch}
                      onChange={handleInputChange}
                      onInput={(e) => {
                        if (!e.target.value.trim()) {
                          clearSearch();
                        }
                      }}
                      className="w-full pl-12 pr-32 py-4 text-lg bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 rounded-2xl border-0 shadow-xl focus:ring-4 focus:ring-white/30 focus:outline-none transition-all duration-300 group-hover:shadow-2xl"
                      placeholder="Search for movies, tv shows..."
                      autoFocus
                    />
                    {movieSearch && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-24 flex items-center pr-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      type="submit"
                      className="absolute inset-y-0 right-0 flex items-center px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-r-2xl hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="px-4 py-8 sm:px-6 lg:px-8">
            {serverError ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <InternalServerError />
              </div>
            ) : (
              <>
                {movieSearch && !searchLoading && (
                  <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {searchResults.length > 0
                        ? `Found ${searchResults.length} results for "${movieSearch}"`
                        : `No results found for "${movieSearch}"`}
                    </h2>
                    {searchResults.length === 0 && (
                      <p className="text-gray-600 dark:text-gray-400">
                        Try searching with different keywords or check your
                        spelling
                      </p>
                    )}
                  </div>
                )}

                {searchLoading ? (
                  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <LoadingPage />
                    <p className="text-lg text-gray-600 dark:text-gray-400 animate-pulse">
                      Searching for movies...
                    </p>
                  </div>
                ) : (
                  <>
                    {searchResults.length > 0 ? (
                      <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                          {searchResults.map((movie, index) => (
                            <div
                              key={movie.imdbID || index}
                              className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                            >
                              <MovieCard movie={movie} onClick={handleClick} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      !movieSearch && (
                        <div className="text-center py-16">
                          <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                              <svg
                                className="w-12 h-12 text-blue-600 dark:text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-8 0h8M7 4L5.5 20h13L17 4M7 4h10m-5 4v8m-3-4h6"
                                />
                              </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              Start Your Movie Journey
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Use the search bar above to discover amazing
                              movies
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {movieSearch && searchResults.length > 0 && !searchLoading && (
            <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {searchResults.length} movies
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Home;
