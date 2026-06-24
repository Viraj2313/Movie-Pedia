import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import Home from "./pages/Home";
import NavBar from "./components/NavBar";
import SignUp from "./pages/auth/SignUp";
import AboutMovie from "./pages/AboutMovie";
import Login from "./pages/auth/Login";
import WishList from "./pages/WishList";
import axios from "axios";
import { triggerNotification } from "./utils/NotificationUtil";
import Friends from "./pages/Friends";
import Chat from "./pages/Chat";
import LoadingPage from "./pages/LoadingPage";
import FriendsToShare from "./pages/FriendsToShare";
import { UserProvider } from "./context/UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import Recommendations from "./pages/Recommendations";
import nProgress from "nprogress";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import WatchDiary from "./pages/WatchDiary";
import Footer from "./components/Footer";
import { useLocation } from "react-router-dom";


function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (location.pathname === "/chatHub") return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 left-6 z-50 w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center hover:from-orange-600 hover:to-orange-700 transition-colors"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function App() {
  const navigate = useNavigate();
  const [user, setUserName] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/user", {
          withCredentials: true,
        });

        if (response.data.userName) {
          setUserName(response.data.userName);
        }
      } catch (error) {
        if (error.response && error.response.status !== 401) {
          toast.error("Failed to authenticate session");
        }
        setUserName(null);
      }
    };

    fetchUser();

    const refreshInterval = setInterval(async () => {
      try {
        await axios.post("/api/auth/refresh", {}, { withCredentials: true });
      } catch {
        handleLogout();
      }
    }, 13 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);
  const location = useLocation();

  useEffect(() => {
    fetch("https://logvisits.duckdns.org/log-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: document.title || "unknown",
        path: location.pathname,
        fullUrl: window.location.href,
        screen: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      nProgress.start();
      const response = await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      toast.success("Logout success");
      setUserId(null);
      setUserName(null);
      navigate("/");
    } catch (error) {
      triggerNotification();
      toast.error(error.response?.data?.message || "Logout failed, please try again");
    } finally {
      nProgress.done();
    }
  };
  return (
    <>
      <UserProvider>
        <NavBar
          user={user}
          setUserName={setUserName}
          setUserId={setUserId}
          handleLogout={handleLogout}
          userId={userId}
        />
        <ToastContainer />
        <ScrollToTop />
        <Routes>
          <Route
            path="/wishlist"
            element={<WishList setSelectedMovie={setSelectedMovie} />}
          ></Route>
          <Route
            path="/"
            element={
              <Home
                setSelectedMovie={setSelectedMovie}
                setUserId={setUserId}
                userId={userId}
              />
            }
          />
          <Route
            path="/signup"
            element={<SignUp setUserName={setUserName} />}
          />
          <Route
            path="/about/:movieName/:imdbID"
            element={<AboutMovie selectedMovie={selectedMovie} />}
          />
          setUserId={setUserId}
          <Route
            path="/login"
            element={<Login setUserName={setUserName} setUserId={setUserId} />}
          />
          <Route
            path="/friends"
            element={
              <Friends user={user} userId={userId} setUserId={setUserId} />
            }
          />
          <Route path="/chatHub" element={<Chat />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/friendstoshare" element={<FriendsToShare />} />
          <Route
            path="/recommendations"
            element={<Recommendations setSelectedMovie={setSelectedMovie} />}
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:userId" element={<UserProfile />} />
          <Route path="/diary" element={<WatchDiary />} />
        </Routes>
      </UserProvider>
      <ScrollToTopButton />
      {location.pathname !== "/chatHub" && <Footer />}
    </>
  );
}

export default App;
