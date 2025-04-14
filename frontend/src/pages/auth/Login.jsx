import axios from "axios";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import nProgress from "nprogress";
import GoogleSignInButton from "@/components/GoogleSignInButton";
const Login = ({ setUserName }) => {
  const { setUserId } = useUser();
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      nProgress.start();
      navigate("/loading");
      const response = await axios.post(`/api/login`, user, {
        withCredentials: true,
      });
      if (response.status === 200) {
        toast.success("Login Success");
        setUserName(response.data.userName);
        setUserId(response.data.userId);
        setUser({ email: "", password: "" });
        navigate("/");
      }
    } catch (error) {
      toast.error("Login failed");
      navigate("/login");
    } finally {
      setLoading(false);
      nProgress.done();
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-[calc(100vh-5rem)] bg-gray-100 dark:bg-gray-900">
      <div className="p-8 rounded-xl shadow-lg w-full max-w-sm bg-white dark:bg-gray-800 dark:text-white">
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="Enter your Email"
            className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-400"
            required
          />
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            placeholder="Enter your Password"
            className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all cursor-pointer dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
      <div className="flex justify-center mt-4 md:w-72 md:m-8 w-full">
        <div className="">
          <GoogleSignInButton setUserName={setUserName} />
        </div>
      </div>
    </div>
  );
};

export default Login;
