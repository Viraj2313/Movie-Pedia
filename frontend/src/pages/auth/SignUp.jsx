import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { triggerNotification } from "../../utils/NotificationUtil";
import { toast } from "react-toastify";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import nProgress from "nprogress";
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
      nProgress.start();
      const response = await axios.post(`/api/register`, user, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUserName(user.name);
        toast.success("Signed Up Successfully");
        setUserState({ name: "", email: "", password: "" });
        navigate("/");
        nProgress.done();
      }
    } catch (error) {
      triggerNotification("Signup failed", "error");
      toast.error("Signup failed");
      navigate("/signup");
      nProgress.done();
    }
  };

  return (
    <div className="flex md:flex-row flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 dark:text-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4">Sign Up</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={user.name}
            onChange={(e) => setUserState({ ...user, name: e.target.value })}
            className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-400"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={user.email}
            onChange={(e) => setUserState({ ...user, email: e.target.value })}
            className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={user.password}
            onChange={(e) =>
              setUserState({ ...user, password: e.target.value })
            }
            className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:underline dark:text-blue-400"
          >
            Login here
          </Link>
        </p>
      </div>
      <div className="flex justify-center mt-4 md:w-72 md:m-8 w-full">
        <div className="w-64 ">
          <GoogleSignInButton setUserName={setUserName} />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
