import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { triggerNotification } from "../../utils/NotificationUtil";
import { toast } from "react-toastify";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const SignUp = ({ setUserName }) => {
  const navigate = useNavigate();
  const [user, setUserState] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      navigate("/loading");
      NProgress.start();
      const response = await axios.post(`/api/register`, user, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUserName(user.name);
        toast.success("Signed Up Successfully");
        setUserState({ name: "", email: "", password: "" });
        navigate("/");
        NProgress.done();
      }
    } catch (error) {
      triggerNotification("Signup failed", "error");
      toast.error("Signup failed");
      navigate("/signup");
      NProgress.done();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-all duration-300">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Create an Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={user.name}
              onChange={(e) => setUserState({ ...user, name: e.target.value })}
              className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={user.email}
              onChange={(e) => setUserState({ ...user, email: e.target.value })}
              className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={user.password}
              onChange={(e) =>
                setUserState({ ...user, password: e.target.value })
              }
              className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
            aria-label="Sign Up"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:underline dark:text-blue-400"
          >
            Login here
          </Link>
        </p>
        <div className="mt-6 flex justify-center">
          <GoogleSignInButton setUserName={setUserName} />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
