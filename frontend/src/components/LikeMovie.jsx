import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Button } from "./ui/button";
import { useUser } from "@/context/UserContext";
const LikeMovie = ({ movieId }) => {
  const { userId, setUserId } = useUser();
  const [liked, setLiked] = useState(null);
  const handleLike = async (value) => {
    if (userId === null) {
      toast.error("Please login to like movies");
      return;
    }
    setLiked(value);
    try {
      console.log(movieId);
      const response = await axios.post(`/api/user-likes`, {
        userId: parseInt(userId),
        movieId: String(movieId),
        liked: value,
      });
      if (response.status === 200) {
        toast.success("Your preference has been saved");
      }
    } catch (error) {
      console.log(error);
      toast.error("Unable to like movie");
    }
  };
  return (
    <>
      <div>
        <div className="mb-2">Do you like this Movie?</div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              handleLike(true);
            }}
            className="cursor-pointer bg-gray-950 text-white"
          >
            Yes
          </Button>
          <Button
            onClick={() => {
              handleLike(false);
            }}
            className="cursor-pointer bg-gray-950 text-white"
          >
            No
          </Button>
        </div>
      </div>
    </>
  );
};
export default LikeMovie;
