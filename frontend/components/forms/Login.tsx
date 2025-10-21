"use client";
import { useRouterInfo } from "@/app/contexts/router.context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, Loader } from "react-feather";

export default function Login() {
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { mac, ip } = useRouterInfo();
  const [loading, setLoading] = useState(false);

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

  const loginUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, mac, ip }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");

      setSuccess(data.message);
      router.push("/");
      setEmail("");
      setPassword("");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-sm shadow-sm border border-gray-200">
        <form onSubmit={loginUser} className="flex flex-col w-full space-y-4">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Welcome back
          </h1>

          <input
            required
            autoComplete="new-email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-sm p-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-400"
          />

          <input
            required
            autoComplete="new-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-sm p-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-400"
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
            className="bg-sky-500 text-white py-2 rounded-sm hover:bg-sky-600 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="h-5 w-5 text-white animate-spin" />
            ) : (
              "Login"
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href={"/register"} className="text-sky-500 hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
