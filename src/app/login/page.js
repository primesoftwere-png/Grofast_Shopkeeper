"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Eye, EyeOff , Loader2} from "lucide-react";
import { login } from "@/services/authService";
import { getToken } from "@/lib/axios";
import ApiTest from "@/components/ApiTest";

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if already logged in
  useEffect(() => {
    const token = getToken();
    if (token) {
      // Already logged in, redirect to dashboard
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ email, password });
      console.log('Login Response:', response);
      
      // Check if login was successful
      if (response && response.success && response.data && response.data.token) {
        // Token is already saved by the service
        console.log('Login successful, token saved');
        
        // Redirect to dashboard on successful login
        router.push("/");
      } else if (response && response.success) {
        // Success but no token (shouldn't happen, but handle it)
        router.push("/");
      } else {
        setError(response?.message || "Login failed");
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* API Test Component - Remove this in production */}
      <ApiTest />
      
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12"
        style={{
          background:
            "linear-gradient(135deg, hsl(103,56%,71%) 0%, hsl(46,100%,85%) 100%)",
        }}
      >
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-3xl bg-card/90 backdrop-blur flex items-center justify-center mx-auto mb-8 shadow-elevated">
            <ShoppingBag className="w-10 h-10 text-primary-dark" />
          </div>

          <h1 className="text-4xl font-bold text-primary-dark mb-4">
            GroFast
          </h1>

          <p className="text-lg text-primary-dark/70">
            Manage your shop, orders and deliveries — all from one powerful dashboard.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              GroFast
            </span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">
            Welcome back
          </h2>

          <p className="text-muted-foreground mb-8">
            Sign in to your shopkeeper panel
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email or Phone
              </label>
              <input
                type="text"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-2xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 pr-12 rounded-2xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-elevated disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (<span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</span>) : "Login"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary-dark font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
