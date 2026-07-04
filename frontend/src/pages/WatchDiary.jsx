import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Calendar, Film, Star, Clock, ChevronLeft, ChevronRight, Search, X, Pencil, Trash2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import LoginRequired from "@/components/LoginRequired";
import { DiaryEntrySkeleton, ProfileSkeleton } from "@/components/Skeletons";
import { DisplayRating } from "@/components/StarRating";
import StarRating from "@/components/StarRating";
import nProgress from "nprogress";

const WatchDiary = () => {
    const { userId } = useUser();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState(null);
    const [diarySearch, setDiarySearch] = useState("");
    const [editingEntry, setEditingEntry] = useState(null);
    const [editForm, setEditForm] = useState({ rating: 0, review: "", watchedAt: "" });
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
            toast.error("Failed to load watch history");
        } finally {
            setLoading(false);
            nProgress.done();
        }
    };

    const handleEditClick = (entry) => {
        setEditingEntry(entry);
        setEditForm({
            rating: entry.rating || 0,
            review: entry.review || "",
            watchedAt: entry.watchedAt ? new Date(entry.watchedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this from your diary?")) return;
        try {
            nProgress.start();
            await axios.delete(`/api/watch-history/remove/${id}`, { withCredentials: true });
            setHistory(history.filter(h => h.id !== id));
            toast.success("Removed from diary");
            fetchStats();
        } catch (err) {
            toast.error("Failed to delete entry");
        } finally {
            nProgress.done();
        }
    };

    const handleUpdate = async () => {
        try {
            nProgress.start();
            await axios.put(`/api/watch-history/update/${editingEntry.id}`, editForm, { withCredentials: true });
            setHistory(history.map(h => 
                h.id === editingEntry.id 
                ? { ...h, ...editForm, watchedAt: new Date(editForm.watchedAt).toISOString() } 
                : h
            ));
            setEditingEntry(null);
            toast.success("Diary updated");
            fetchStats();
        } catch (err) {
            toast.error("Failed to update entry");
        } finally {
            nProgress.done();
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get(`/api/watch-history/stats/${userId}`);
            setStats(res.data);
        } catch (err) {
            toast.error("Failed to load watch statistics");
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

    const filteredHistory = diarySearch.trim()
        ? history.filter((e) =>
              e.movieTitle.toLowerCase().includes(diarySearch.toLowerCase())
          )
        : history;

    if (!userId) {
        return <LoginRequired />;
    }

    if (loading && page === 1) {
        return (
            <div className="min-h-screen px-4 py-8">
                <div className="max-w-5xl mx-auto">
                    <div className="animate-pulse h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                                    <div className="space-y-2">
                                        <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <DiaryEntrySkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 dark:from-zinc-900 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-800 to-zinc-500 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent mb-2">
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
                            <Star className="w-6 h-6 text-zinc-900 dark:text-white mx-auto mb-2" />
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
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={diarySearch}
                                onChange={(e) => setDiarySearch(e.target.value)}
                                placeholder="Search your diary..."
                                className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-zinc-900 dark:border-white focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 outline-none transition-all dark:text-white"
                            />
                            <AnimatePresence>
                                {diarySearch && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={() => setDiarySearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <X className="w-4 h-4" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    {filteredHistory.length > 0 ? (
                        <>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                <AnimatePresence>
                                    {filteredHistory.map((entry, index) => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <Link to={`/about/${entry.movieTitle}/${entry.movieId}`}>
                                                {entry.moviePoster !== "N/A" ? (
                                                    <img
                                                        src={entry.moviePoster}
                                                        alt={entry.movieTitle}
                                                        className="w-16 h-24 object-cover rounded-lg shadow-md flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-24 rounded-lg shadow-md flex-shrink-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                                        <Film className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    to={`/about/${entry.movieTitle}/${entry.movieId}`}
                                                    className="font-semibold text-gray-900 dark:text-white hover:text-zinc-900 dark:text-white transition-colors block truncate"
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
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleEditClick(entry)}
                                                    className="p-2 text-gray-400 hover:text-zinc-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
                                                    title="Edit Entry"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
                                                    title="Delete Entry"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                                {diarySearch ? `No results for "${diarySearch}"` : "No movies logged yet"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {diarySearch ? "Try a different title" : "Start tracking your movie journey"}
                            </p>
                            {!diarySearch && (
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-lg transition-colors"
                                >
                                    <Film size={18} />
                                    Browse Movies
                                </Link>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
            {editingEntry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Diary Entry</h2>
                            <button onClick={() => setEditingEntry(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Watched</label>
                                <input
                                    type="date"
                                    value={editForm.watchedAt}
                                    onChange={(e) => setEditForm({ ...editForm, watchedAt: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-zinc-900 dark:focus:border-white text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                                <StarRating
                                    rating={editForm.rating}
                                    setRating={(val) => setEditForm({ ...editForm, rating: val })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review (Optional)</label>
                                <textarea
                                    value={editForm.review}
                                    onChange={(e) => setEditForm({ ...editForm, review: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-zinc-900 dark:focus:border-white text-gray-900 dark:text-white resize-none"
                                    placeholder="Write your thoughts..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingEntry(null)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg font-medium transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default WatchDiary;
