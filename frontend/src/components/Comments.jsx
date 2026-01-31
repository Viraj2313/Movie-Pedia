import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import { toast } from "react-toastify";
import { ThumbsUp, ThumbsDown, MessageCircle, Trash2, Send, CornerDownRight } from "lucide-react";

const Comments = ({ movieId }) => {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const { userId } = useUser();
  const [commentInput, setCommentInput] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `/api/movies/${movieId}/get-comments`,
          {
            params: { userId: userId || null },
          },
        );

        if (response.status === 200) {
          setComments(response.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [movieId, refresh, userId]);

  const toggleReaction = async (commentId, reaction) => {
    try {
      if (!userId) {
        toast.error("Login first");
        return;
      }

      await axios.post(
        `/api/movies/${movieId}/comments/${commentId}/toggle-reaction`,
        null,
        {
          params: { userId, reaction },
        },
      );

      setRefresh(!refresh);
    } catch (error) {
      toast.error("Failed to react");
    }
  };

  const handleAddComment = async (parentCommentId = null) => {
    try {
      if (!userId) {
        toast.error("You need to login first");
        return;
      }

      const text = parentCommentId
        ? replyInputs[parentCommentId]
        : commentInput;

      if (!text || text.trim() === "") {
        toast.info("Comment cannot be empty");
        return;
      }

      const response = await axios.post(`/api/movies/add-comment`, {
        userId: parseInt(userId),
        movieId,
        commentText: text,
        parentCommentId,
      });

      if (response.status === 200) {
        setCommentInput("");

        if (parentCommentId) {
          const newReplyInputs = { ...replyInputs };
          delete newReplyInputs[parentCommentId];
          setReplyInputs(newReplyInputs);
        }

        toast.success("Comment added");
        setRefresh(!refresh);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await axios.delete(
        `/api/movies/${userId}/${movieId}/${commentId}`,
      );
      if (response.status === 200) {
        toast.success("Comment deleted");
        setRefresh(!refresh);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete comment");
    }
  };

  const toggleReplyInput = (commentId) => {
    setReplyInputs((prev) => {
      const newReplyInputs = { ...prev };

      if (commentId in newReplyInputs) {
        delete newReplyInputs[commentId];
      } else {
        newReplyInputs[commentId] = "";
      }

      return newReplyInputs;
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const CommentItem = ({ comment, isReply = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group ${isReply ? "ml-10 mt-3" : "mt-4"}`}
    >
      <div className="flex gap-3">
        <div className={`${isReply ? "w-8 h-8" : "w-10 h-10"} flex-shrink-0 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center`}>
          <span className={`${isReply ? "text-xs" : "text-sm"} font-medium text-gray-600 dark:text-gray-300`}>
            {comment.commentorName?.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {comment.commentorName}
            </span>
            <span className="text-xs text-gray-400">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 leading-relaxed">
            {comment.commentText}
          </p>

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => toggleReaction(comment.id, "like")}
              className={`flex items-center gap-1.5 text-xs transition-colors ${comment.userReaction === "like"
                  ? "text-blue-500"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
            >
              <ThumbsUp size={14} className={comment.userReaction === "like" ? "fill-current" : ""} />
              {comment.commentLikes > 0 && <span>{comment.commentLikes}</span>}
            </button>

            <button
              onClick={() => toggleReaction(comment.id, "dislike")}
              className={`flex items-center gap-1.5 text-xs transition-colors ${comment.userReaction === "dislike"
                  ? "text-red-500"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
            >
              <ThumbsDown size={14} className={comment.userReaction === "dislike" ? "fill-current" : ""} />
              {comment.commentDislikes > 0 && <span>{comment.commentDislikes}</span>}
            </button>

            {!isReply && (
              <button
                onClick={() => toggleReplyInput(comment.id)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <MessageCircle size={14} />
                Reply
              </button>
            )}

            {comment.commentorId === parseInt(userId) && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {comment.id in replyInputs && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex gap-2"
              >
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <CornerDownRight size={14} className="text-gray-400" />
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={replyInputs[comment.id]}
                    onChange={(e) =>
                      setReplyInputs({
                        ...replyInputs,
                        [comment.id]: e.target.value,
                      })
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment(comment.id)}
                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                  <button
                    onClick={() => handleAddComment(comment.id)}
                    className="px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-80 transition-opacity"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="border-l-2 border-gray-100 dark:border-gray-800 ml-5">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircle size={18} className="text-gray-400" />
          Discussion
          {comments.length > 0 && (
            <span className="text-xs font-normal text-gray-400 ml-1">
              ({comments.length})
            </span>
          )}
        </h3>
      </div>

      <div className="p-5">
        <div className="flex gap-3">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {userId ? "Y" : "?"}
            </span>
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder={userId ? "Add a comment..." : "Login to comment..."}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              disabled={!userId}
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAddComment()}
              disabled={!userId || !commentInput.trim()}
              className="px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Post
            </motion.button>
          </div>
        </div>

        <div className="mt-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comments;
