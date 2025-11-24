import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

import g_icon from "../assets/google.svg";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(userCredential.user, { displayName: name });
      }
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  const sideTitle = isLogin ? "Welcome Back 👋" : "Join Us 👋";
  const sideText = isLogin
    ? "Access your personalized mutual fund dashboard. Stay updated, stay ahead."
    : "Create your FundScope account and unlock smart mutual fund insights, analytics, and predictions.";
  const toggleText = isLogin ? "Create Account" : "Login";

  return (
    <div className="flex min-h-screen font-sans text-base">
      {/* Left Side */}
      <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-gradient-to-br from-blue-500 via-blue-300 to-green-200">
        <div className="w-[380px] text-center bg-white bg-opacity-20 backdrop-blur-xl p-10 rounded-2xl shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
            <span className="text-blue-600">Fund</span>
            <span className="text-white">Scope</span>
          </h1>
          <h2 className="text-4xl font-bold mb-4 text-black">{sideTitle}</h2>
          <p className="mb-8 text-lg text-gray-700 break-words">{sideText}</p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="bg-white text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition"
          >
            {toggleText}
          </button>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md border border-gray-200">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            {isLogin ? "Login to FundScope" : "Create FundScope Account"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3 rounded-md text-lg font-semibold shadow transition-all"
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-gray-500">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 py-3 rounded-md flex items-center justify-center gap-3 text-md font-medium transition-all shadow-sm"
            >
              <img src={g_icon} alt="Google" className="h-5 w-5" />
              {isLogin ? "Login with Google" : "Sign Up with Google"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
