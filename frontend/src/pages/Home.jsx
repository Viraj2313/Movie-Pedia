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
        setMovies(response.data);
        setSearchResults(response.data);
        setLoading(false);
        nProgress.done();
      })
      .catch((error) => {
        console.error(error);
        setServerError(true);
        setError("Unable to fetch movies from server");
        setLoading(false);
        nProgress.done();
      });
  }, []);

  useEffect(() => {
    if (!movieSearch.trim()) {
      setSearchResults([...movies]);
      return;
    }

    setSearchLoading(true);
    const searchWords = movieSearch.toLowerCase().split(" ");
    const filteredMovies = movies.filter((movie) =>
      searchWords.every((word) => movie.Title.toLowerCase().includes(word))
    );

    if (filteredMovies.length > 0) {
      setSearchResults(filteredMovies);
      setSearchLoading(false);
    } else {
      axios
        .get(`/api/home/search-movie/${movieSearch}`)
        .then((response) => {
          setSearchResults(response.data.Search || []);
          setSearchLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
          setSearchLoading(false);
        });
    }
  }, [movieSearch, movies]);

  const handleClick = (movie) => {
    setSelectedMovie(movie.imdbID);
    navigate(`/about/${movie.Title}/${movie.imdbID}`);
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="min-h-screen dark:bg-gray-900 text-gray-900 dark:text-gray-200 p-4 m-4">
          <div className="flex justify-center items-center mb-6 p-4 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg shadow-gray-500/40 dark:shadow-gray-900/80 w-full md:1/2 sm:1/2 lg:w-3/4 mx-auto">
            <input
              type="text"
              value={movieSearch}
              onChange={(e) => setSearchMovie(e.target.value)}
              className="border-b-2 border-gray-500 bg-transparent text-lg px-4 py-2 rounded-lg w-full sm:w-[380px] focus:outline-none focus:border-blue-500 placeholder-gray-400 dark:placeholder-gray-500 dark:text-white"
              placeholder="Search for a movie..."
              autoFocus
            />
            <button
              className="bg-blue-600 text-white rounded-lg px-6 py-3 ml-4 text-lg font-semibold shadow-md hover:scale-105 transition-transform duration-300 hover:bg-blue-700 focus:outline-none cursor-pointer"
              onClick={() => setSearchMovie(movieSearch)}
            >
              Search
            </button>
          </div>

          {serverError ? (
            <div className="flex justify-center">
              <InternalServerError />
            </div>
          ) : (
            <>
              {searchLoading ? (
                <div className="flex items-center justify-center w-full h-40">
                  <LoadingPage />
                </div>
              ) : (
                <ul className="movie-list grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5 p-5">
                  {searchResults.length > 0 ? (
                    searchResults.map((movie, index) => (
                      <MovieCard
                        movie={movie}
                        key={index}
                        onClick={handleClick}
                      />
                    ))
                  ) : (
                    <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400 text-center">
                      No movies found. Try a different search term.
                    </p>
                  )}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Home;
