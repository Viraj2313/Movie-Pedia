import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import LoginRequired from "@/components/LoginRequired";
import axios from "axios";
import LoadingPage from "@/components/LoadingPage";
const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    id: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          console.log(res.data);

          setLoading(false);
        }
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    getUserDetails();
  }, []);

  return (
    <>
      <h1 className="text-xl font-semibold flex items-center justify-center text-gray-800 dark:text-white mt-2">
        Your Details
      </h1>
      {loading ? (
        <LoadingPage />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-6">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 space-y-4">
            <p className="text-gray-700 dark:text-gray-200">
              <span className="font-medium">Name:</span> {user.name}
            </p>
            <p className="text-gray-700 dark:text-gray-200">
              <span className="font-medium">Id:</span> {user.id}
            </p>
            <p className="text-gray-700 dark:text-gray-200">
              <span className="font-medium">Email:</span> {user.email}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
