import React from "react";
import { motion } from "framer-motion";
import { Film, Star, MessageCircle, Users } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color, highlight }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className={`rounded-xl p-4 shadow-sm border ${highlight ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"}`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
                {typeof Icon === "string" ? (
                    <span className="text-xl leading-none">{Icon}</span>
                ) : (
                    <Icon size={20} />
                )}
            </div>
            <div>
                <p className={`text-2xl font-bold ${highlight ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}>{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
            </div>
        </div>
    </motion.div>
);

const UserStats = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
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
        );
    }

    const streak = stats?.weekStreak || 0;

    const statItems = [
        {
            icon: Film,
            label: "Films",
            value: stats?.totalWatched || 0,
            color: "bg-blue-100 dark:bg-blue-900/30 text-blue-500",
        },
        {
            icon: Star,
            label: "Avg Rating",
            value: stats?.averageRating || "-",
            color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500",
        },
        {
            icon: MessageCircle,
            label: "Reviews",
            value: stats?.totalReviews || 0,
            color: "bg-purple-100 dark:bg-purple-900/30 text-purple-500",
        },
        {
            icon: Users,
            label: "Friends",
            value: stats?.friendCount || 0,
            color: "bg-green-100 dark:bg-green-900/30 text-green-500",
        },
        {
            icon: "🔥",
            label: "Week Streak",
            value: streak > 0 ? `${streak}w` : "—",
            color: "bg-amber-100 dark:bg-amber-900/30 text-amber-500",
            highlight: streak > 0,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {statItems.map((item) => (
                <StatCard key={item.label} {...item} />
            ))}
        </div>
    );
};

export default UserStats;
