import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/styles/Home.css";
import Loader from "../components/Loader";
import { triggerNotification } from "../utils/NotificationUtil";
import { Navigate, useNavigate } from "react-router-dom";
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
      console.log(wishlist);
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

  //handle remove a movie
  const handleRemove = async (movie) => {
    try {
      nProgress.start();
      const movieToDel = {
        movieId: movie.movieId,
      };
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
    console.log(movie);
    navigate(`/about/${movie.movieTitle}/${movie.movieId}`);
    console.log(`Clicked on movie with ID: ${movie.imdbID}`);
  };

  return (
    <>
      {userId ? (
        loading ? (
          <Loader />
        ) : (
          <>
            <div className="text-2xl font-bold mt-5 ml-5">WishList</div>
            {wishlist && wishlist.length > 0 ? (
              <ul className="movie-list grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5 p-5 animate-fadeIn">
                {wishlist.map((item) => (
                  <li
                    key={item.id}
                    className="list-none flex flex-col text-center justify-start movie relative cursor-pointer overflow-hidden shadow-[0px_1px_11px_5px_rgba(0,0,0,0.4)] after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-[rgba(0,0,0,0.7)] after:z-10 after:pointer-events-none"
                  >
                    <img
                      src={item.moviePoster}
                      alt={`${item.movieTitle} Poster`}
                      onClick={() => handleClick(item)}
                      className="w-[100%] h-auto transition-transform duration-300 ease hover:scale-110 hover:z-10"
                    />
                    <h3 className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 z-20 text-white p-1.5 px-4 rounded-md text-lg shadow-[1px_1px_5px_rgba(0,0,0,0.8)] w-64">
                      <span className="break-words mr-4 text-xl">
                        {item.movieTitle}
                      </span>
                      <button
                        onClick={() => handleRemove(item)}
                        style={{ backgroundColor: "#ff5722" }}
                        className="mt-2 border-none cursor-pointer bg-[#ff5722] text-white p-1.5 px-4 rounded-md transition-colors duration-300 ease relative z-20 hover:bg-[#e64a19]"
                      >
                        Remove
                      </button>
                    </h3>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex justify-center items-center w-full h-[50vh]">
                <p className="text-xl">No movies in wishlist</p>
              </div>
            )}
          </>
        )
      ) : (
        <LoginRequired />
      )}
    </>
  );
};

export default WishList;
