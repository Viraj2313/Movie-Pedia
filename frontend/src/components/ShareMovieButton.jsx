import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, MessageCircle, X } from "lucide-react";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ShareMovieButton = ({ movieTitle }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef();
  const buttonRef = useRef();

  const movieUrl = decodeURIComponent(window.location.href).replaceAll(" ", "");
  const shareText = `Hey! Check out this movie "${movieTitle}". Here's the link: ${movieUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(movieUrl)}&text=${encodeURIComponent(shareText)}`;

  const openLink = (url) => {
    window.open(url, "_blank");
    setShowMenu(false);
  };

  const handleShareToChat = () => {
    navigate(`/friendstoshare?message=${encodeURIComponent(shareText)}`);
    setShowMenu(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(movieUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") setShowMenu(false);
    };
    if (showMenu) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showMenu]);

  const shareItems = [
    {
      label: "WhatsApp",
      icon: FaWhatsapp,
      iconClass: "text-green-500",
      hoverClass: "hover:bg-green-50 dark:hover:bg-green-900/20",
      action: () => openLink(whatsappUrl),
    },
    {
      label: "Telegram",
      icon: FaTelegramPlane,
      iconClass: "text-sky-500",
      hoverClass: "hover:bg-sky-50 dark:hover:bg-sky-900/20",
      action: () => openLink(telegramUrl),
    },
    {
      label: "Share to Chat",
      icon: MessageCircle,
      iconClass: "text-indigo-500",
      hoverClass: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
      action: handleShareToChat,
    },
    {
      label: copied ? "Copied!" : "Copy Link",
      icon: copied ? Check : Copy,
      iconClass: copied ? "text-green-500" : "text-gray-500",
      hoverClass: "hover:bg-gray-50 dark:hover:bg-gray-700/50",
      action: handleCopyLink,
    },
  ];

  return (
    <div className="relative" ref={buttonRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowMenu((prev) => !prev)}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors w-full"
      >
        <Share2 className="w-4 h-4" />
        Share
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full mb-2 right-0 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Share Movie
              </span>
              <button
                onClick={() => setShowMenu(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-1.5 space-y-0.5">
              {shareItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.label}
                    whileHover={{ x: 2 }}
                    onClick={item.action}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors ${item.hoverClass}`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${item.iconClass}`} />
                    {item.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareMovieButton;
