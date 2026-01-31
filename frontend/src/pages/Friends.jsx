import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, UserPlus, Users, RefreshCw, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";
import LoginRequired from "@/components/LoginRequired";
import Loader, { InlineLoader } from "@/components/Loader";
import nProgress from "nprogress";

const Friends = ({ user }) => {
  const { userId, setUserId } = useUser();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [friend, setFriend] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

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
      const response = await axios.get(`/api/friends/get-friends-list`, {
        params: { userId },
      });
      if (response.status === 200) {
        setLoading(false);
        setFriends(response.data);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleAcceptReq = async (senderId) => {
    try {
      await axios.post(`/api/friends/accept-request`, null, {
        params: { userId, senderId },
      });
      getFriendRequests();
      getFriendsList();
      toast.success("Friend request accepted!");
    } catch (error) {
      toast.error("Couldn't accept friend request");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) {
      toast.error("Enter username or ID first");
      return;
    }

    try {
      setSearching(true);
      nProgress.start();
      setFriend(null);
      setSearchResults([]);

      const isNumber = !isNaN(searchText);

      if (isNumber) {
        const response = await axios.get(`/api/friends/search`, {
          params: { friendId: searchText },
        });
        if (response.status === 200) {
          setFriend(response.data);
          toast.success("Friend found");
        }
      } else {
        const response = await axios.get(`/api/friends/search-by-name`, {
          params: { username: searchText },
        });
        if (response.status === 200) {
          setSearchResults(response.data);
          toast.success("Friends found");
        }
      }
    } catch (error) {
      toast.error("No user found");
    } finally {
      setSearching(false);
      nProgress.done();
    }
  };

  const handleSendFriendReq = async (receiverId) => {
    try {
      nProgress.start();
      await axios.post(`/api/friends/send-request`, null, {
        params: { senderId: userId, receiverId },
      });
      setFriend(null);
      setSearchResults([]);
      toast.success("Friend request sent!");
    } catch (error) {
      toast.error("Friend request not sent");
    } finally {
      nProgress.done();
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

  if (!user) {
    return <LoginRequired />;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-4 md:p-6"
    >
      <motion.h1
        variants={itemVariants}
        className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
      >
        Friends
      </motion.h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Friends List */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Your Friends</h3>
          </div>

          {loading ? (
            <InlineLoader />
          ) : friends.length > 0 ? (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {friends.map((friendItem, index) => (
                  <motion.li
                    key={friendItem.friendId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/chatHub?senderId=${userId}&receiverId=${friendItem.friendId}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-orange-50 dark:hover:bg-gray-600 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {friendItem.friendName.charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 font-medium">{friendItem.friendName}</span>
                      <MessageCircle className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </Link>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No friends added yet
            </p>
          )}
        </motion.div>

        {/* Search Friends */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Find Friends</h3>
          </div>

          <form onSubmit={handleSearch} className="space-y-3">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Username or ID..."
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:bg-gray-700 dark:text-white transition-all outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={searching}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-medium disabled:opacity-60"
            >
              {searching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </motion.button>
          </form>

          {/* Search Results */}
          <AnimatePresence>
            {friend && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <p className="font-semibold">{friend.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID: {friend.id}</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSendFriendReq(friend.id)}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Send Request
                </motion.button>
              </motion.div>
            )}

            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 space-y-2 max-h-48 overflow-y-auto"
              >
                {searchResults.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  >
                    <p className="font-semibold">{f.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {f.id}</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSendFriendReq(f.id)}
                      className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
                    >
                      <UserPlus className="w-3 h-3" />
                      Add
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Friend Requests */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold">Requests</h3>
              {friendRequests.length > 0 && (
                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium rounded-full">
                  {friendRequests.length}
                </span>
              )}
            </div>
            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              onClick={getFriendRequests}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </motion.button>
          </div>

          {friendRequests.length > 0 ? (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {friendRequests.map((request, index) => (
                  <motion.li
                    key={request.senderId}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {request.senderName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{request.senderName}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAcceptReq(request.senderId)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Accept
                    </motion.button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No pending requests
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Friends;
