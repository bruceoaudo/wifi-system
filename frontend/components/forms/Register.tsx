"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader } from "react-feather";
import { useRouterInfo } from "@/app/contexts/router.context";

export default function Register() {
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { mac, ip } = useRouterInfo();

    // Wait briefly for mac/ip to load
    useEffect(() => {
      const timer = setTimeout(() => {
        setCheckingConnection(false);
      }, 1000); // small delay so context has time to populate
  
      return () => clearTimeout(timer);
    }, [mac, ip]);
  
    // Still checking connection
    if (checkingConnection) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
          <Loader className="animate-spin text-sky-500 w-10 h-10 mb-4" />
          <h1 className="text-xl text-gray-700">Checking connection...</h1>
        </div>
      );
    }
  
    // After checking, if still missing mac/ip
    if (!ip || !mac) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            You&apos;re not connected to WiFi
          </h1>
          <p className="text-gray-600 max-w-md mb-6">
            It looks like you opened this page manually. Please connect to the
            WiFi and try visiting any website — you&apos;ll be redirected here
            automatically.
          </p>
          <div className="w-full sm:w-[100px]">
            <button
              onClick={() => window.location.reload()}
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-1.5 px-8 rounded-sm inline-block"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

  const registerUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong.");

      setSuccess(data.message);
      router.push("/login");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-sm shadow-sm border border-gray-200 mx-3">
        <form
          className="flex flex-col w-full space-y-4"
          onSubmit={registerUser}
        >
          <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">
            Create Account
          </h1>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-2 rounded-sm focus:ring-2 focus:ring-sky-400 outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-2 rounded-sm focus:ring-2 focus:ring-sky-400 outline-none"
            required
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-gray-300 p-2 rounded-sm focus:ring-2 focus:ring-sky-400 outline-none"
            required
          />

          {error && (
            <p className="text-red-500 text-sm flex gap-x-1 items-center">
              <AlertCircle className="h-5 w-5" />
              {error}
            </p>
          )}

          {success && (
            <p className="text-green-500 text-sm flex gap-x-1 items-center">
              <AlertCircle className="h-5 w-5" />
              {success}
            </p>
          )}

          <button
            disabled={loading}
            type="submit"
            className={`bg-sky-500 border-none text-white py-2 rounded-sm cursor-pointer transition flex items-center justify-center ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-sky-600"
            }`}
          >
            {loading ? (
              <Loader className="h-5 w-5 text-white animate-spin" />
            ) : (
              "Register"
            )}
          </button>

          <p className="mt-2 text-center text-gray-700">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-sky-500 underline hover:text-sky-600"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
