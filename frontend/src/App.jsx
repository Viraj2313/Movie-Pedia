import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
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
        console.log("User not logged in or session expired.");
      }
    };

    fetchUser();

    const sessionInterval = setInterval(checkSessionExpiration, 1800000);

    return () => clearInterval(sessionInterval);
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
  const checkSessionExpiration = async () => {
    try {
      const response = await axios.get("/api/check-session", {
        withCredentials: true,
      });

      if (response.status === 200 && response.data.userId) {
        console.log("Session Active:", response.data.userId);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Session expired or invalid:", error);
      handleLogout();
    }
  };
  const handleLogout = async () => {
    try {
      nProgress.start();
      const response = await axios.post(
        "/api/logout",
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
      toast.error("Logout failed, please try again");
      console.log("Logout failed", error.response?.data || error.message);
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
      <Footer />
    </>
  );
}

export default App;
