"use client";

import { useEffect, useState } from "react";
import { useRouterInfo } from "./contexts/router.context";
import { AlertCircle, CheckCircle, Loader } from "react-feather";

export default function Home() {
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [okMessage, setOkMessage] = useState("");
  const [done, setDone] = useState(false);

  const { mac, ip, linkOrig } = useRouterInfo();

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

  const plans = [
    {
      name: "Basic Plan",
      slug: "basic-plan",
      price: "50",
      duration: "1 Day",
      description: "Perfect for beginners.",
    },
    {
      name: "Standard Plan",
      slug: "standard-plan",
      price: "500",
      duration: "1 Week",
      description: "Best value plan.",
    },
    {
      name: "Premium Plan",
      slug: "premium-plan",
      price: "1500",
      duration: "1 Month",
      description: "Full access plan.",
    },
  ];

  const handleBuyClick = (slug: string) => {
    setSelectedPlan(slug);
    setShowModal(true);
    setErrorMessage("");
    setOkMessage("");
  };

  const handleConfirmPurchase = async () => {
    if (!phone) {
      setErrorMessage("Please enter your phone number.");
      setOkMessage(""); // clear success
      return;
    }

    setOkMessage("Check your phone to complete payment.");
    setErrorMessage(""); // clear error
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/payments/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slug: selectedPlan, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Purchase failed");

      setOkMessage(`${data.message}. Happy browsing!`);
      setErrorMessage(""); // clear error
      setDone(true);
      setPhone("");
      setSelectedPlan(null);

      // Redirect after short delay
      if (linkOrig) {
        setTimeout(() => {
          window.location.href = linkOrig; // redirect to original site
        }, 2000);
      }
    } catch (err) {
      if (err instanceof Error) setErrorMessage(err.message);
      else setErrorMessage("An unknown error occurred");
      setOkMessage(""); // clear success
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <h1 className="text-4xl font-bold text-center mb-12">
        Choose Your Subscription Plan
      </h1>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.slug}
            className="bg-white rounded-md border border-[rgba(0,0,0,0.2)] p-8 flex flex-col items-center text-center transition"
          >
            <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
            <p className="text-4xl font-bold text-sky-600 mb-4">
              Ksh.{plan.price}
            </p>
            <p className="text-gray-600 mb-2">{plan.duration}</p>
            <p className="text-gray-500 mb-8">{plan.description}</p>

            <button
              onClick={() => handleBuyClick(plan.slug)}
              className="w-full py-2 rounded-sm text-white font-semibold bg-sky-500 hover:bg-sky-600 transition hover:cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div className="bg-white rounded-sm shadow-sm w-[90%] max-w-md p-6 relative">
            <h2 className="text-2xl font-semibold mb-9 text-center">
              Enter Your Phone Number
            </h2>

            <input
              type="tel"
              placeholder="e.g. 0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full mb-4"
              required
            />

            {/* Show only one message at a time */}
            {errorMessage && (
              <p className="text-red-500 text-sm flex gap-x-1 items-center mb-4">
                <AlertCircle className="h-5 w-5" />
                {errorMessage}
              </p>
            )}

            {okMessage && (
              <p className="text-green-600 text-sm flex gap-x-1 items-center mb-4">
                <CheckCircle className="h-5 w-5" />
                {okMessage}
              </p>
            )}

            <div className="flex justify-between gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setErrorMessage("");
                  setOkMessage("");
                  setLoading(false);
                  setSelectedPlan(null);
                  setPhone("");
                  setDone(false);
                }}
                className="w-1/2 py-2 border border-[rgba(0,0,0,0.3)] rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                disabled={loading || done}
                onClick={handleConfirmPurchase}
                className={`w-1/2 py-2 rounded-md text-white font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-sky-500 hover:bg-sky-600"
                }`}
              >
                {loading ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
