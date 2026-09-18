"use client";

import { useEffect, useState } from "react";

type SubscriptionModalProps = {
  open: boolean;
  token: string | null;
  onClose: () => void;
  onSuccess: () => void;
};

const API_URL = "http://localhost:5000";

type Subscription = {
  SUBSCRIPTION_ID?: number;
  USER_ID?: number;
  PLAN_TYPE?: string;
  START_DATE?: string;
  END_DATE?: string | null;
};

type PaymentMethod = "UPI" | "CARD";

export default function SubscriptionModal({
  open,
  token,
  onClose,
  onSuccess,
}: SubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [checkingPlan, setCheckingPlan] = useState(false);

  const [currentPlan, setCurrentPlan] =
    useState<Subscription | null>(null);

  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("UPI");

  const [upiId, setUpiId] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    if (!open || !token) {
      setCurrentPlan(null);
      setPaymentStep(false);
      return;
    }

    const checkCurrentPlan = async () => {
      setCheckingPlan(true);

      try {
        const response = await fetch(
          `${API_URL}/api/subscriptions/my`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.status === 404) {
          setCurrentPlan(null);
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.details ||
              "Failed to check subscription"
          );
        }

        setCurrentPlan(data);
      } catch (error) {
        console.error(
          "Subscription check error:",
          error
        );

        setCurrentPlan(null);
      } finally {
        setCheckingPlan(false);
      }
    };

    checkCurrentPlan();
  }, [open, token]);

  if (!open) {
    return null;
  }

  const isPremium =
    String(currentPlan?.PLAN_TYPE || "").toUpperCase() ===
    "PREMIUM";

  // ==================================================
  // START PAYMENT
  // ==================================================

  const handleGetPremium = () => {
    if (!token) {
      alert("Please login first.");
      onClose();
      return;
    }

    if (isPremium) {
      alert(
        "You already have an active Premium subscription."
      );
      return;
    }

    setPaymentStep(true);
  };

  // ==================================================
  // VALIDATE PAYMENT
  // ==================================================

  const validatePayment = () => {
    if (paymentMethod === "UPI") {
      if (!upiId.trim()) {
        alert("Please enter your UPI ID.");
        return false;
      }

      if (!upiId.includes("@")) {
        alert("Please enter a valid UPI ID.");
        return false;
      }

      return true;
    }

    if (!cardNumber.trim()) {
      alert("Please enter your card number.");
      return false;
    }

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      alert("Card number must contain 16 digits.");
      return false;
    }

    if (!cardName.trim()) {
      alert("Please enter the name on the card.");
      return false;
    }

    if (!cardExpiry.trim()) {
      alert("Please enter card expiry.");
      return false;
    }

    if (!cardCvv.trim()) {
      alert("Please enter CVV.");
      return false;
    }

    if (cardCvv.length !== 3) {
      alert("CVV must contain 3 digits.");
      return false;
    }

    return true;
  };

  // ==================================================
  // PAY
  // ==================================================

  const handlePayment = async () => {
    if (!token) {
      alert("Please login first.");
      return;
    }

    if (!validatePayment()) {
      return;
    }

    setLoading(true);

    try {
      // ------------------------------------------------
      // 1. Create subscription in Oracle
      // ------------------------------------------------

      const subscriptionResponse = await fetch(
        `${API_URL}/api/subscriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan_type: "PREMIUM",
          }),
        }
      );

      const subscriptionData =
        await subscriptionResponse.json();

      if (!subscriptionResponse.ok) {
        throw new Error(
          subscriptionData.error ||
            subscriptionData.details ||
            "Failed to create subscription"
        );
      }

      // ------------------------------------------------
      // 2. Record payment in Oracle
      // ------------------------------------------------

      const paymentResponse = await fetch(
        `${API_URL}/api/payments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subscription_id:
              subscriptionData.subscription
                ?.SUBSCRIPTION_ID,
            amount: 999,
            payment_mode: paymentMethod,
          }),
        }
      );

      const paymentData =
        await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData.error ||
            paymentData.details ||
            "Payment failed"
        );
      }

      // ------------------------------------------------
      // 3. Update UI immediately
      // ------------------------------------------------

      setCurrentPlan(
        subscriptionData.subscription
      );

      setPaymentStep(false);

      // Clear payment fields
      setUpiId("");
      setCardNumber("");
      setCardName("");
      setCardExpiry("");
      setCardCvv("");

      alert(
        "Payment successful!\n\nYour Premium account has been registered successfully."
      );

      // Refresh current plan on main page
      onSuccess();
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Payment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // PAYMENT PAGE
  // ==================================================

  if (paymentStep) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#111111] p-6 shadow-2xl">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Payment
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Premium subscription
              </p>
            </div>

            <button
              onClick={() => setPaymentStep(false)}
              disabled={loading}
              className="rounded-full border border-gray-700 px-3 py-1 text-gray-400 hover:bg-gray-800"
            >
              ✕
            </button>
          </div>

          {/* PRICE */}

          <div className="mb-5 rounded-xl border border-gray-800 bg-[#151515] p-5">
            <p className="text-sm text-gray-500">
              Amount to pay
            </p>

            <p className="mt-1 text-3xl font-bold">
              ₹999
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Premium · 1 year
            </p>
          </div>

          {/* PAYMENT OPTIONS */}

          <p className="mb-3 text-sm font-medium text-gray-400">
            Choose payment method
          </p>

          <div className="grid grid-cols-2 gap-3">

            <button
              onClick={() =>
                setPaymentMethod("UPI")
              }
              disabled={loading}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                paymentMethod === "UPI"
                  ? "border-white bg-white text-black"
                  : "border-gray-700 text-gray-400 hover:bg-gray-800"
              }`}
            >
              📱 UPI
            </button>

            <button
              onClick={() =>
                setPaymentMethod("CARD")
              }
              disabled={loading}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                paymentMethod === "CARD"
                  ? "border-white bg-white text-black"
                  : "border-gray-700 text-gray-400 hover:bg-gray-800"
              }`}
            >
              💳 Card
            </button>

          </div>

          {/* UPI */}

          {paymentMethod === "UPI" && (
            <div className="mt-5">
              <label className="mb-2 block text-sm text-gray-400">
                UPI ID
              </label>

              <input
                type="text"
                placeholder="example@upi"
                value={upiId}
                onChange={(e) =>
                  setUpiId(e.target.value)
                }
                className="w-full rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 text-sm outline-none focus:border-gray-400"
              />

              <p className="mt-2 text-xs text-gray-600">
                Example: yourname@upi
              </p>
            </div>
          )}

          {/* CARD */}

          {paymentMethod === "CARD" && (
            <div className="mt-5 space-y-3">

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Card number
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  placeholder="1234567812345678"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16)
                    )
                  }
                  className="w-full rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 text-sm outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Name on card
                </label>

                <input
                  type="text"
                  placeholder="Your Name"
                  value={cardName}
                  onChange={(e) =>
                    setCardName(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 text-sm outline-none focus:border-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Expiry
                  </label>

                  <input
                    type="text"
                    maxLength={5}
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) =>
                      setCardExpiry(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 text-sm outline-none focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    CVV
                  </label>

                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={3}
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) =>
                      setCardCvv(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 3)
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 text-sm outline-none focus:border-gray-400"
                  />
                </div>

              </div>

            </div>
          )}

          {/* PAY BUTTON */}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="mt-6 w-full rounded-full bg-white py-3 font-semibold text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Processing Payment..."
              : "Pay ₹999"}
          </button>

          <button
            onClick={() => setPaymentStep(false)}
            disabled={loading}
            className="mt-3 w-full rounded-full border border-gray-700 py-3 text-sm text-gray-400 hover:bg-gray-800"
          >
            Back
          </button>

        </div>
      </div>
    );
  }

  // ==================================================
  // SUBSCRIPTION PAGE
  // ==================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#111111] p-6 shadow-2xl">

        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Subscription
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose your MusicStream plan
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-gray-700 px-3 py-1 text-gray-400 hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        {/* CURRENT PLAN */}

        <div className="rounded-2xl border border-gray-800 bg-[#151515] p-6">

          <p className="text-sm text-gray-500">
            Current plan
          </p>

          {checkingPlan ? (
            <p className="mt-2 text-lg text-gray-400">
              Checking...
            </p>
          ) : isPremium ? (
            <>
              <h3 className="mt-1 text-xl font-bold">
                ⭐ Premium
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                ₹999 / year
              </p>

              {currentPlan?.END_DATE && (
                <p className="mt-2 text-sm text-gray-400">
                  Valid until{" "}
                  {new Date(
                    currentPlan.END_DATE
                  ).toLocaleDateString("en-IN")}
                </p>
              )}
            </>
          ) : (
            <>
              <h3 className="mt-1 text-xl font-bold">
                Free
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                You are currently on the Free plan.
              </p>
            </>
          )}

        </div>

        {/* PREMIUM */}

        <div className="mt-4 rounded-2xl border border-gray-800 bg-[#151515] p-6">

          <h3 className="text-xl font-bold">
            ⭐ Premium
          </h3>

          <p className="mt-2 text-3xl font-bold">
            ₹999
            <span className="text-sm font-normal text-gray-500">
              {" "}
              / year
            </span>
          </p>

          <ul className="mt-5 space-y-2 text-sm text-gray-400">
            <li>✓ Premium subscription</li>
            <li>✓ One year validity</li>
            <li>✓ MusicStream Premium account</li>
          </ul>

          <button
            onClick={handleGetPremium}
            disabled={
              checkingPlan || isPremium
            }
            className="mt-6 w-full rounded-full bg-white py-3 font-semibold text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkingPlan
              ? "Checking..."
              : isPremium
              ? "Already Premium"
              : "Get Premium"}
          </button>

        </div>

      </div>
    </div>
  );
}