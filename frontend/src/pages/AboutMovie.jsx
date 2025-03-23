import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import Loader from "../components/Loader";
import "../assets/styles/AboutMovie.css";
import { useOpenLink } from "../hooks/useOpenLink";
import { useNavigate, useParams } from "react-router-dom";
import SaveMovie from "../components/SaveMovie";
import ShareMovieButton from "../components/ShareMovieButton";
import LikeMovie from "../components/LikeMovie";
import { Button } from "../components/ui/button";
import { AiFillSound } from "react-icons/ai";
import Comments from "@/components/Comments";
import nProgress from "nprogress";
const AboutMovie = () => {
  const { imdbID } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [watchPlatforms, setWatchPlatforms] = useState([]);

  useEffect(() => {
    if (imdbID) {
      fetchMovieDetails();
    }
  }, [imdbID]);

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
  const goToTrailer = async (movieTitle) => {
    const openLink = useOpenLink();

    const newTab = openLink(`/loading`, "_blank");

    try {
      const response = await axios.post(`/api/get-trailer-url`, {
        movieTitle: movieTitle,
      });
      const youtubeUrl = response.data;

      if (youtubeUrl && newTab) {
        newTab.location.href = youtubeUrl;
      }
    } catch (error) {
      console.log(error);
      newTab.close();
    }
  };

  const goToImdb = async (movieTitle) => {
    const openLink = useOpenLink();
    const newTab = openLink("/loading", "_blank");
    try {
      const response = await axios.post(`/api/get-imdb-url`, {
        movieTitle: movieTitle,
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

      if (Array.isArray(response.data)) {
        setWatchPlatforms(response.data);
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
      console.log(response.data);
      const wikiUrl = response.data;

      if (wikiUrl && newTab) {
        console.log(wikiUrl);
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
      console.log(response.data);
      const reviewUrl = response.data;

      if (reviewUrl && newTab) {
        console.log(reviewUrl);
        newTab.location.href = reviewUrl;
      }
    } catch (error) {
      newTab.close();
      console.error("Failed to get Rotten Tomatoes URL:", error);
    }
  };
  return (
    <div className="max-w-screen-lg mx-auto p-4 animate-fadeIn">
      {loading ? (
        <div className="flex justify-center items-center h-vw">
          <Loader />
        </div>
      ) : movieDetails ? (
        <div className="space-y-6 animate-fadeIn">
          <h1 className="text-3xl font-bold text-center">About Movie</h1>
          <div className=" shadow-lg rounded-lg overflow-hidden p-6 dark:bg-gray-800">
            <h2 className="text-2xl font-semibold mb-4">
              {movieDetails.Title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex justify-center">
                <img
                  className="rounded-lg shadow-md max-w-xs"
                  src={movieDetails.Poster}
                  alt={movieDetails.Title}
                />
              </div>
              <div className="space-y-4">
                {Array.isArray(watchPlatforms) && watchPlatforms.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-semibold  mb-4 text-center tracking-wide">
                      Where to Watch
                    </h3>
                    <ul className="flex flex-wrap justify-center gap-3">
                      {watchPlatforms.map((platform, index) => (
                        <li
                          key={index}
                          className="px-4 py-2  rounded-md text-sm font-medium hover:bg-gray-200 transition"
                        >
                          {platform}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 mb-4 md:flex md:justify-center md:gap-3">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer"
                onClick={() => goToTrailer(movieDetails.Title)}
              >
                See Trailer on YouTube
              </button>
              <button
                className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition cursor-pointer"
                onClick={() => goToImdb(movieDetails.Title)}
              >
                See Details on IMDb
              </button>
              <button
                className="bg-zinc-300 text-black px-4 py-2 rounded-md hover:bg-zinc-600 transition cursor-pointer"
                onClick={() => goToWiki(movieDetails.Title)}
              >
                Know more on Wikipedia
              </button>
              <button
                className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition cursor-pointer"
                onClick={() => getReviews(movieDetails.Title)}
              >
                Read Reviews (Rotten Tomatoes)
              </button>
              <ShareMovieButton
                className="min-h-full"
                movieTitle={movieDetails.Title}
              />
              <SaveMovie />
            </div>

            <p className="text-lg ">{movieDetails.Plot}</p>
            <Button
              className="bg-blue-500  hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 px-4 py-2 rounded-2xl hover:cursor-pointer mt-2"
              onClick={handleReadPlot}
            >
              <AiFillSound />
              {isPlaying ? "Stop Reading" : "Read Plot Aloud"}
            </Button>
          </div>
          <div>
            <LikeMovie movieId={movieDetails.imdbID} />
          </div>
          <div>
            <Comments movieId={movieDetails.imdbID} />
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-600">
          No movie selected or no details available.
        </div>
      )}
    </div>
  );
};

export default AboutMovie;
