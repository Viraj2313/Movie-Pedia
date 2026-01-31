import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { Calendar, Film, Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "@/context/UserContext";
import LoginRequired from "@/components/LoginRequired";
import { PageLoader } from "@/components/Loader";
import { DisplayRating } from "@/components/StarRating";
import nProgress from "nprogress";

const WatchDiary = () => {
    const { userId } = useUser();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState(null);
    const pageSize = 20;

    useEffect(() => {
        if (userId) {
            fetchHistory();
            fetchStats();
        }
    }, [userId, page]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            nProgress.start();
            const res = await axios.get(`/api/watch-history/my-history`, {
                params: { page, pageSize },
                withCredentials: true,
            });
            setHistory(res.data.history);
            setTotal(res.data.total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            nProgress.done();
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get(`/api/watch-history/stats/${userId}`);
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const totalPages = Math.ceil(total / pageSize);

    if (!userId) {
        return <LoginRequired />;
    }

    if (loading && page === 1) {
        return <PageLoader message="Loading your diary..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent mb-2">
                        Watch Diary
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your personal movie watching journey
                    </p>
                </motion.div>

                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center">
                            <Film className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.totalWatched}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                Films
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center">
                            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.averageRating || "-"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                Avg Rating
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center">
                            <Star className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.totalRated}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                Rated
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center">
                            <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.totalReviews}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                Reviews
                            </p>
                        </div>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
                >
                    {history.length > 0 ? (
                        <>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                <AnimatePresence>
                                    {history.map((entry, index) => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <Link to={`/about/${entry.movieTitle}/${entry.movieId}`}>
                                                <img
                                                    src={entry.moviePoster}
                                                    alt={entry.movieTitle}
                                                    className="w-16 h-24 object-cover rounded-lg shadow-md flex-shrink-0"
                                                />
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    to={`/about/${entry.movieTitle}/${entry.movieId}`}
                                                    className="font-semibold text-gray-900 dark:text-white hover:text-orange-500 transition-colors block truncate"
                                                >
                                                    {entry.movieTitle}
                                                </Link>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    <Calendar size={14} />
                                                    {formatDate(entry.watchedAt)}
                                                </div>
                                                {entry.rating && (
                                                    <div className="mt-2">
                                                        <DisplayRating rating={entry.rating} />
                                                    </div>
                                                )}
                                                {entry.review && (
                                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                                        {entry.review}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-100 dark:border-gray-700">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={20} />
                                    </motion.button>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Page {page} of {totalPages}
                                    </span>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={20} />
                                    </motion.button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <Film className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No movies logged yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Start tracking your movie journey
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                            >
                                <Film size={18} />
                                Browse Movies
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default WatchDiary;
