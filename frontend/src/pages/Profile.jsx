import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Mail, Hash, Users, Film, Star, MessageCircle, ChevronRight } from "lucide-react";
import { useUser } from "@/context/UserContext";
import LoginRequired from "@/components/LoginRequired";
import axios from "axios";
import { ProfileSkeleton } from "@/components/Skeletons";
import ActivityFeed from "@/components/ActivityFeed";
import UserStats from "@/components/UserStats";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    id: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const { userId } = useUser();

  useEffect(() => {
    if (userId) {
      getUserDetails();
      fetchStats();
      fetchActivity();
    }
  }, [userId]);

  const getUserDetails = async () => {
    try {
      const res = await axios.get("/api/get-user-profile", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setUser({
          name: res.data.name,
          id: res.data.id,
          email: res.data.email,
        });
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`/api/profile/${userId}`, {
        withCredentials: true,
      });
      setStats(res.data.stats);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchActivity = async () => {
    try {
      setActivityLoading(true);
      const res = await axios.get(`/api/activity/user/${userId}`);
      setRecentActivity(res.data.activities.slice(0, 5));
    } catch (err) {
      console.log(err);
    } finally {
      setActivityLoading(false);
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

  if (!userId) {
    return <LoginRequired />;
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-2xl mx-auto pt-8"
      >
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-xl shadow-orange-500/25">
            <span className="text-4xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2"
        >
          {user.name}
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-center text-gray-500 dark:text-gray-400 mb-6"
        >
          Moviepedia Member
        </motion.p>

        <motion.div variants={itemVariants} className="mb-6">
          <UserStats stats={stats} loading={!stats} />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <Link to="/diary">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg h-full">
                  <Film className="w-5 h-5 text-purple-500" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Watch Diary</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
          </Link>

          <Link to="/friends">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Friends</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <Link
              to={`/user/${userId}`}
              className="text-sm text-orange-500 hover:text-orange-600"
            >
              View All
            </Link>
          </div>
          <ActivityFeed
            activities={recentActivity}
            loading={activityLoading}
            showUser={false}
            emptyMessage="No activity yet. Start watching movies!"
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Account Details
          </h2>

          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Full Name
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Email Address
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                User ID
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.id}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
