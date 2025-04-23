import React, { useEffect, useState, useRef } from "react";
import "../assets/styles/AboutMovie.css";
import { FaWhatsapp, FaTelegramPlane, FaCommentDots } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
const ShareMovieButton = ({ movieTitle, API_URL }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState("bottom");
  const navigate = useNavigate();
  const menuRef = useRef();
  const buttonRef = useRef();
  const movieUrl = decodeURIComponent(window.location.href).replaceAll(" ", "");
  const shareText = `Hey! Check out this movie "${movieTitle}". Here's the link: ${movieUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    movieUrl
  )}&text=${encodeURIComponent(shareText)}`;

  const openLink = (url) => {
    window.open(url, "_blank");
    setShowMenu(false);
  };

  const handleShare = () => {
    navigate(`/friendstoshare?message=${encodeURIComponent(shareText)}`);
    setShowMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showMenu) {
      const rect = menuRef.current.getBoundingClientRect();
      const buttonRect = buttonRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        setMenuPosition("top");
      } else {
        setMenuPosition("bottom");
      }
    }
  }, [showMenu]);

  return (
    <div className="relative inline-block" ref={buttonRef}>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition shadow-md cursor-pointer w-full"
        onClick={() => setShowMenu(!showMenu)}
      >
        Share with Friends
      </button>

      {showMenu && (
        <div
          ref={menuRef}
          className={`absolute ${
            menuPosition === "bottom" ? "bottom-0 mt-2" : "top-0 mb-2"
          } right-0 w-48 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-10 z-30 animate-slide-in overflow-hidden max-h-48 overflow-y-auto`}
        >
          <ul className="py-2">
            <li
              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-green-50 transition"
              onClick={() => openLink(whatsappUrl)}
            >
              <FaWhatsapp className="text-green-500 text-lg" /> WhatsApp
            </li>
            <li
              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-blue-50 transition"
              onClick={() => openLink(telegramUrl)}
            >
              <FaTelegramPlane className="text-blue-500 text-lg" /> Telegram
            </li>
            <li
              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-indigo-50 transition"
              onClick={handleShare}
            >
              <FaCommentDots className="text-indigo-500 text-lg" /> Share to
              Chat
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
export default ShareMovieButton;
