import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Users, UserPlus, Film, Star, MessageCircle, X } from "lucide-react";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import ActivityFeed from "@/components/ActivityFeed";
import UserStats from "@/components/UserStats";
import { ProfileSkeleton } from "@/components/Skeletons";
import nProgress from "nprogress";

const UserProfile = () => {
    const { userId: profileUserId } = useParams();
    const { userId: currentUserId } = useUser();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFriends, setShowFriends] = useState(false);
    const [friends, setFriends] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [sendingRequest, setSendingRequest] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [profileUserId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            nProgress.start();
            const res = await axios.get(`/api/profile/${profileUserId}`, {
                withCredentials: true,
            });
            setProfile(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
            nProgress.done();
        }
    };

    const fetchFriends = async () => {
        try {
            setFriendsLoading(true);
            const res = await axios.get(`/api/profile/${profileUserId}/friends`);
            setFriends(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setFriendsLoading(false);
        }
    };

    const handleShowFriends = () => {
        setShowFriends(true);
        if (friends.length === 0) {
            fetchFriends();
        }
    };

    const handleSendRequest = async () => {
        try {
            setSendingRequest(true);
            nProgress.start();
            await axios.post(`/api/friends/send-request`, null, {
                params: { senderId: currentUserId, receiverId: profileUserId },
            });
            toast.success("Friend request sent!");
            setProfile((prev) => ({ ...prev, hasPendingRequest: true }));
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send request");
        } finally {
            setSendingRequest(false);
            nProgress.done();
        }
    };

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        User Not Found
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        This profile doesn't exist
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-xl shadow-orange-500/25 mb-4">
                        <span className="text-4xl font-bold text-white">
                            {profile.user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {profile.user.name}
                    </h1>

                    <button
                        onClick={handleShowFriends}
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
                    >
                        <Users size={18} />
                        <span className="font-medium">{profile.stats.friendCount} friends</span>
                    </button>

                    {currentUserId && !profile.isOwnProfile && (
                        <div className="mt-4">
                            {profile.isFriend ? (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                                    <Users size={16} />
                                    Friends
                                </span>
                            ) : profile.hasPendingRequest ? (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-medium">
                                    Request Pending
                                </span>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSendRequest}
                                    disabled={sendingRequest}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-medium transition-colors disabled:opacity-60"
                                >
                                    <UserPlus size={16} />
                                    Add Friend
                                </motion.button>
                            )}
                        </div>
                    )}

                    {profile.isOwnProfile && (
                        <Link
                            to="/profile"
                            className="inline-block mt-4 text-sm text-orange-500 hover:text-orange-600"
                        >
                            Edit Profile
                        </Link>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <UserStats stats={profile.stats} loading={false} />
                </motion.div>

                {profile.favoriteMovies && profile.favoriteMovies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Favorite Films
                            </h2>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {profile.favoriteMovies.map((movie) => (
                                <Link
                                    key={movie.movieId}
                                    to={`/about/${movie.movieTitle}/${movie.movieId}`}
                                    className="flex-shrink-0"
                                >
                                    <motion.div whileHover={{ scale: 1.05 }} className="relative">
                                        <img
                                            src={movie.moviePoster}
                                            alt={movie.movieTitle}
                                            className="w-20 h-28 object-cover rounded-lg shadow-md"
                                        />
                                        <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-xs text-yellow-400 font-medium">
                                            ★{movie.rating}
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Film className="w-5 h-5 text-orange-500" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Recent Activity
                        </h2>
                    </div>
                    <ActivityFeed
                        activities={profile.recentActivity}
                        loading={false}
                        showUser={false}
                        emptyMessage="No activity yet"
                    />
                </motion.div>
            </div>

            <AnimatePresence>
                {showFriends && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowFriends(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[70vh] overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Friends ({profile.stats.friendCount})
                                </h3>
                                <button
                                    onClick={() => setShowFriends(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto max-h-[50vh]">
                                {friendsLoading ? (
                                    <div className="space-y-3">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                                            </div>
                                        ))}
                                    </div>
                                ) : friends.length > 0 ? (
                                    <div className="space-y-2">
                                        {friends.map((friend) => (
                                            <Link
                                                key={friend.friendId}
                                                to={`/user/${friend.friendId}`}
                                                onClick={() => setShowFriends(false)}
                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                                            >
                                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {friend.friendName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {friend.friendName}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                        No friends yet
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserProfile;
