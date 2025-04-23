import { createContext, useContext, useState, useEffect } from "react";
import { getUserIdFromToken } from "../utils/GetUserIdFromToken";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true);
        await getUserIdFromToken(setUserId);
      } finally {
        setAuthLoading(false);
      }
    };
    getUserIdFromToken(setUserId);
    checkAuth();
  }, []);

  return (
    <UserContext.Provider value={{ userId, setUserId, authLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
