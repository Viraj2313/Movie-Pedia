import axios from "axios";
import React, { useEffect, useState } from "react";
import { triggerNotification } from "../utils/NotificationUtil";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";
import LoginRequired from "@/components/LoginRequired";
import nProgress from "nprogress";
const Friends = ({ user }) => {
  const { userId, setUserId } = useUser();
  const [friends, setFriends] = useState([]);
  const [friendId, setFriendId] = useState("");
  const [friend, setFriend] = useState({});
  const [friendFound, setFriendFound] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const Loader = () => (
    <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-blue-600"></div>
  );
  useEffect(() => {
    const fetchData = async () => {
      await getUserIdFromToken();
      if (userId) {
        getFriendsList();
        getFriendRequests();
      }
    };

    fetchData();
  }, [userId]);

  const getUserIdFromToken = async () => {
    try {
      const response = await axios.get(`/api/get-user-id`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setUserId(response.data.userId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFriendRequests = async () => {
    try {
      const response = await axios.get(`/api/friends/get-friend-requests`, {
        params: { userId },
      });
      if (response.status === 200) {
        setFriendRequests(response.data);
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const getFriendsList = async () => {
    try {
      console.log(userId);
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

  const handleAcceptReq = async (senderId) => {
    try {
      await axios.post(`/api/friends/accept-request`, null, {
        params: { userId, senderId },
      });
      getFriendRequests();
      getFriendsList();
    } catch (error) {
      toast.error("Couldn't accept friend request");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!friendId) {
      toast.error("Enter student ID first");
      return;
    }
    try {
      const response = await axios.get(`/api/friends/search`, {
        params: { friendId },
      });
      nProgress.start();
      if (response.status === 200) {
        setFriend(response.data);
        setFriendFound(true);
        toast.success("Friend found");
        nProgress.done();
      }
    } catch (error) {
      toast.error("Friend not found");
      nProgress.done();
    }
  };

  const handleSendFriendReq = async () => {
    try {
      nProgress.start();
      await axios.post(`/api/friends/send-request`, null, {
        params: { senderId: userId, receiverId: friend.id },
      });
      setFriendFound(false);
      setFriend({});
      nProgress.done();
      toast.success("Friend request sent!");
    } catch (error) {
      nProgress.done();
      toast.error("Friend request not sent");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-center sm:text-2xl mb-4">
        Your Friends
      </h2>

      {user ? (
        <div className="flex flex-col lg:flex-row lg:space-x-6">
          {/* Friends List */}
          <div className="lg:w-1/3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Your Friends</h3>
            <ul className="overflow-y-auto max-h-60 space-y-2">
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <Link
                    key={friend.friendId}
                    to={`/chatHub?senderId=${userId}&receiverId=${friend.friendId}`}
                    className="block p-2 bg-gray-100 dark:bg-gray-700 rounded shadow-md hover:bg-gray-600 transition"
                  >
                    {friend.friendName}
                  </Link>
                ))
              ) : loading ? (
                <Loader />
              ) : (
                <p className="text-gray-500">No friends added yet.</p>
              )}
            </ul>
          </div>

          {/* Search Friend */}
          <div className="lg:w-1/3 bg-white p-4 rounded-lg shadow-md mt-6 lg:mt-0 dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2">Search Friend</h3>
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={friendId}
                onChange={(e) => setFriendId(e.target.value)}
                placeholder="Enter friend's ID"
                className="border border-gray-300 rounded-md px-3 py-2 flex-1"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer"
              >
                Search
              </button>
            </form>

            {friendFound && (
              <div className="mt-4 p-3 border border-gray-300 dark:bg-gray-800 rounded-md bg-gray-50">
                <p className="font-semibold">Name: {friend.name}</p>
                <p className="text-gray-500">ID: {friend.id}</p>
                <button
                  onClick={handleSendFriendReq}
                  className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition cursor-pointer"
                >
                  Send Request
                </button>
              </div>
            )}
          </div>

          {/*Friend Requests */}
          <div className="lg:w-1/3 p-4 rounded-lg shadow-md mt-6 lg:mt-0 dark:bg-gray-800">
            <h3 className="flex text-lg font-semibold mb-2 flex-row">
              Friend Requests
              <img
                src="/refresh.png"
                alt=""
                className="ml-1.5 flex-row max-w-[7%] max-h-[7%] cursor-pointer"
                onClick={getFriendsList}
              />
            </h3>
            <ul className="overflow-y-auto max-h-60 space-y-2">
              {friendRequests.length > 0 ? (
                friendRequests.map((request) => (
                  <li
                    key={request.senderId}
                    className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md shadow-md flex justify-between items-center"
                  >
                    <span>{request.senderName}</span>
                    <button
                      onClick={() => handleAcceptReq(request.senderId)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition cursor-pointer"
                    >
                      Accept
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No friend requests.</p>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <LoginRequired />
      )}
    </div>
  );
};

export default Friends;
