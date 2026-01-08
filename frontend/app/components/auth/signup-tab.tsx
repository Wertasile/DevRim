import React, { useState } from "react";
import { useGoogleLogin } from '@react-oauth/google';
import { useUser } from '../../context/userContext';

const API_URL = import.meta.env.VITE_API_URL;

const SignUpTab = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { setUser } = useUser();

  const fetchUser = async () => {
    const user = await fetch(`${API_URL}/me`, {
        method: 'get',
        credentials: 'include'
    });

    if (!user.ok) {
        console.error("Failed to fetch user info");
        return;
    }

    const userData = await user.json();
    console.log(userData);
    setUser(userData);
  };

  const googleLogin = useGoogleLogin({
      onSuccess: async (code) => {
          try {
              // login, get tokens from backend which is sent in response as cookies
              const tokens = await fetch(`${API_URL}/auth/google`, {
                  method: 'post',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                  body: JSON.stringify({ code }),
              });

              if (tokens.ok) {
                  // fetch user details
                  await fetchUser();
                  // Redirect to dashboard
                  window.location.href = "/dashboard";
              } else {
                  setError("Failed to authenticate with Google. Please try again.");
                  setIsSubmitting(false);
              }
          } catch (err) {
              console.error("Google login error:", err);
              setError("Something went wrong. Please try again.");
              setIsSubmitting(false);
          }
      },
      onError: () => {
          console.error('Connecting to Google Failed');
          setError("Google authentication failed. Please try again.");
          setIsSubmitting(false);
      },
      flow: 'auth-code',
  });

  const handleGoogleSignUp = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    googleLogin();
  };

  const handleSignUp = async (e: any) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Attempting to sign up with email:", email, "name:", name);
      const response = await fetch(`${API_URL}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, name }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        const errorMsg = data.error || data.message || "Something went wrong. Please try again.";
        console.error("Sign up failed:", errorMsg, "Full response:", data);
        setError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Update user context
      if (data.user) {
        console.log("User signed up successfully:", data.user);
        setUser(data.user);
      }

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Sign up error:", err);
      console.error("Error details:", err.message, err.stack);
      setError(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form
        autoComplete="on"
        className="flex flex-col gap-5"
        onSubmit={handleSignUp}
      >
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Name Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <input
            id="name"
            placeholder="John Doe"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
            className="form-input"
          />
        </div>

        {/* Email Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            id="email"
            placeholder="you@example.com"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            className="form-input"
          />
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            placeholder="At least 8 characters"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            minLength={8}
            className="form-input"
          />
          <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
        </div>

        {/* Confirm Password Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            placeholder="Re-enter your password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting}
            className="form-input"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`primary-btn w-full py-3 mt-2 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${isSubmitting ? "bg-[#353535]" : "hover:bg-[#D84333] hover:shadow-lg"}`}
        >
          {isSubmitting ? "Creating Account..." : "SIGN UP"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t-2 border-gray-300"></div>
        <span className="px-4 text-sm text-gray-500 font-medium">OR</span>
        <div className="flex-1 border-t-2 border-gray-300"></div>
      </div>

      {/* Google Sign Up Button */}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleGoogleSignUp}
        className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold border-2 border-black rounded-lg py-3 px-4 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        style={{ boxShadow: "0 2px 0 2px #000000" }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>
    </div>
  );
};

export default SignUpTab;
