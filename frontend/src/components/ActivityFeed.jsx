import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, Star, MessageCircle, Heart, Clock } from "lucide-react";

const activityIcons = {
    watched: Eye,
    watched_rated: Star,
    rated: Star,
    reviewed: MessageCircle,
    added_wishlist: Heart,
    comment: MessageCircle,
};

const activityColors = {
    watched: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
    watched_rated: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30",
    rated: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30",
    reviewed: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
    added_wishlist: "text-red-500 bg-red-100 dark:bg-red-900/30",
    comment: "text-green-500 bg-green-100 dark:bg-green-900/30",
};

const getActivityText = (activity) => {
    const { activityType, movieTitle, details } = activity;

    switch (activityType) {
        case "watched":
            return `watched ${movieTitle}`;
        case "watched_rated":
            const rating = details ? JSON.parse(details).rating : null;
            return `watched ${movieTitle} and rated it ${rating ? `★${rating}` : ""}`;
        case "rated":
            const ratingVal = details ? JSON.parse(details).rating : null;
            return `rated ${movieTitle} ${ratingVal ? `★${ratingVal}` : ""}`;
        case "reviewed":
            return `reviewed ${movieTitle}`;
        case "added_wishlist":
            return `added ${movieTitle} to watchlist`;
        case "comment":
            return `commented on ${movieTitle}`;
        default:
            return `interacted with ${movieTitle}`;
    }
};

const formatTime = (dateString) => {
    if (!dateString) return "";

    // Backend sends UTC timestamps without 'Z' suffix
    // Append 'Z' to treat as UTC if no timezone indicator exists
    let normalizedDate = dateString;
    if (!dateString.endsWith('Z') && !dateString.match(/[+-]\d{2}:\d{2}$/)) {
        normalizedDate = dateString + 'Z';
    }

    const date = new Date(normalizedDate);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

const ActivityItem = ({ activity, showUser = true }) => {
    const Icon = activityIcons[activity.activityType] || Eye;
    const colorClass = activityColors[activity.activityType] || activityColors.watched;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
            {activity.moviePoster && (
                <Link to={`/about/${activity.movieTitle}/${activity.movieId}`}>
                    <img
                        src={activity.moviePoster}
                        alt={activity.movieTitle}
                        className="w-12 h-16 object-cover rounded-lg shadow-md flex-shrink-0"
                    />
                </Link>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1.5 rounded-lg ${colorClass}`}>
                        <Icon size={14} />
                    </div>
                    {showUser && (
                        <Link
                            to={`/user/${activity.userId}`}
                            className="font-semibold text-gray-900 dark:text-white hover:text-orange-500 transition-colors"
                        >
                            {activity.userName}
                        </Link>
                    )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {showUser ? getActivityText(activity).replace(activity.userName, "") : getActivityText(activity)}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <Clock size={12} />
                    {formatTime(activity.createdAt)}
                </div>
            </div>
        </motion.div>
    );
};

const ActivityFeed = ({ activities, loading, showUser = true, emptyMessage = "No activity yet" }) => {
    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
                        <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} showUser={showUser} />
            ))}
        </div>
    );
};

export default ActivityFeed;
