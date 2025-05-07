import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../components/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";

const categoryImages = [
  `${process.env.PUBLIC_URL}/image1.png`,
  `${process.env.PUBLIC_URL}/image2.png`,
  `${process.env.PUBLIC_URL}/image3.png`,
  `${process.env.PUBLIC_URL}/image4.png`,
  `${process.env.PUBLIC_URL}/image5.png`,
  `${process.env.PUBLIC_URL}/image6.png`,
  `${process.env.PUBLIC_URL}/image7.png`,
  `${process.env.PUBLIC_URL}/image8.png`,
  `${process.env.PUBLIC_URL}/image9.png`,
  `${process.env.PUBLIC_URL}/image10.png`,
];

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginUser = useCallback(async (e) => {
    e.preventDefault();
    setError("");

    // Check for admin credentials first
    if (username.trim() === "admin12" && password.trim() === "admin12") {
      localStorage.setItem("admin", "true");
      navigate("/admin");
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("username", "==", username.trim().toLowerCase()),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("User not found");
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (!userData.email) {
        throw new Error("Invalid user account");
      }

      await signInWithEmailAndPassword(auth, userData.email, password.trim());

      const userToStore = {
        uid: userDoc.id,
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName || userData.username
      };

      localStorage.setItem("user", JSON.stringify(userToStore));
      navigate("/profile");
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again";

      switch (error.code) {
        case "auth/wrong-password":
          errorMessage = "Invalid password";
          break;
        case "auth/user-not-found":
          errorMessage = "User not found";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Try again later";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Check your connection";
          break;
        default:
          if (error instanceof Error && error.message) {
            errorMessage = error.message;
          }
          break;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [username, password, navigate]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-700 overflow-hidden">
      <h1 className="absolute text-[200px] font-extrabold text-green-300 opacity-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none">
        TASKNEST
      </h1>

      <div className="absolute inset-0 grid grid-cols-5 grid-rows-2 gap-4 p-10 opacity-40">
        {categoryImages.map((src, index) => (
          <motion.div
            key={index}
            className="w-48 h-48 bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-green-300 flex items-center justify-center"
            animate={{ y: [0, -20, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              delay: index * 0.2,
            }}
          >
            <img src={src} alt={`Category ${index + 1}`} className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 bg-white bg-opacity-95 p-8 rounded-xl shadow-lg w-full max-w-md border-4 border-green-400">
        <div className="bg-green-600 p-6 text-white text-center rounded-t-xl">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={loginUser} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
              autoComplete="username"
              placeholder="Enter your username"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? 'bg-green-500' : 'bg-green-600'} text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-green-600 hover:underline text-sm"
              onClick={() => navigate("/forgot-password")}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-green-600 font-semibold hover:underline"
                onClick={() => navigate("/register")}
                disabled={loading}
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(Login);