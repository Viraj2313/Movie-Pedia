import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true);
        const response = await axios.get("/api/auth/check-session", {
          withCredentials: true,
        });
        if (response.status === 200) {
          setUserId(response.data.userId);
        }
      } catch {
        try {
          const refreshRes = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
          if (refreshRes.status === 200) {
            setUserId(refreshRes.data.userId);
          }
        } catch {
          setUserId(null);
          setUserName(null);
        }
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!userId) {
      setUserName(null);
      return;
    }
    axios
      .get("/api/user", { withCredentials: true })
      .then((res) => {
        if (res.data.userName) setUserName(res.data.userName);
      })
      .catch(() => {});
  }, [userId]);

  return (
    <UserContext.Provider value={{ userId, setUserId, userName, setUserName, authLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
