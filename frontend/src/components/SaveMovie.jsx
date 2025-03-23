import React from "react";
import { triggerNotification } from "../utils/NotificationUtil";
import axios from "axios";
import { toast } from "react-toastify";
import nProgress from "nprogress";
const SaveMovie = ({ movie, userId }) => {
  const handleSave = async (movie, e) => {
    e.stopPropagation();
    try {
      nProgress.start();
      if (!userId) {
        toast.error("You need to login first");
        return;
      }

      const moviesToSave = {
        userId: userId,
        movieTitle: movie.Title,
        movieId: movie.imdbID,
        moviePoster: movie.Poster,
      };
      console.log(moviesToSave);
      const response = await axios.post(`/api/add_wishlist`, moviesToSave, {
        withCredentials: true,
      });
      if (response.status == 200) {
        toast.success("Movie added to wishlist");
        nProgress.done();
      }
    } catch (error) {
      nProgress.done();
      triggerNotification(response.data.error);
      console.log(error);
    }
  };

  return (
    <>
      <button
        className=" border-none cursor-pointer bg-[#ff5722] text-white p-1.5 px-4 rounded-md transition-colors duration-300 ease relative z-20 hover:bg-[#e64a19]"
        onClick={(e) => handleSave(movie, e)}
      >
        Save
      </button>
    </>
  );
};
export default SaveMovie;
