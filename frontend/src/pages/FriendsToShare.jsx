import React, { useEffect, useState } from "react";
import { getUserIdFromToken } from "../utils/GetUserIdFromToken";
import { useUser } from "../context/UserContext";
import Loader from "../components/Loader";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import { toast } from "react-toastify";
const FriendsToShare = () => {
  const { userId, setUserId } = useUser();
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const message = params.get("message");
  const [connection, setConnection] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    console.log("Message: ", message);
    const fetchUserIdAndFriends = async () => {
      try {
        await getUserIdFromToken(setUserId);
      } catch (error) {
        console.log("error: ", error);
      }
    };
    fetchUserIdAndFriends();
  }, []);

  useEffect(() => {
    if (userId) {
      console.log("User ID Set: ", userId);
      getFriendsList();

      //signalr connection
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`/chatHub?senderId=${userId}`)
        .withAutomaticReconnect()
        .build();

      newConnection
        .start()
        .then(() => {
          console.log("SignalR Connected");
          setConnection(newConnection);
        })
        .catch((err) => console.error("SignalR Error: ", err));
    }
  }, [userId]);

  const getFriendsList = async () => {
    try {
      const response = await axios.get(`/api/friends/get-friends-list`, {
        params: { userId },
      });
      if (response.status === 200) {
        setLoading(false);
        setFriends(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClick = async (friendId) => {
    if (message && connection) {
      try {
        console.log(typeof Number(userId), typeof friendId, typeof message);
        await connection.invoke(
          "SendMessage",
          Number(userId),
          friendId,
          message
        );
        navigate(-1);
        toast.success(`Message sent`);
      } catch (err) {
        console.error("Message Sending Error: ", err);
      }
    } else {
      toast.error("Message not available or SignalR not connected");
    }
  };

  return (
    <>
      {userId ? (
        <div className="lg:w-1/3 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">
            Choose friend to share movie
          </h3>
          <ul className="overflow-y-auto max-h-60 space-y-2">
            {loading ? (
              <Loader />
            ) : friends.length > 0 ? (
              friends.map((friend) => (
                <div
                  key={friend.friendId}
                  className="block p-2 bg-gray-100 rounded shadow-md hover:bg-gray-200 transition"
                  onClick={() => handleClick(friend.friendId)}
                >
                  {friend.friendName}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No friends added yet.</p>
            )}
          </ul>
        </div>
      ) : (
        <p className="flex justify-center items-center h-[50vh] w-full text-2xl sm:text-4xl">
          User not logged in
        </p>
      )}
    </>
  );
};

export default FriendsToShare;
