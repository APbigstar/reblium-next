"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Stripe from "@/provider/Stripe";
import CardElement from "@/components/StripeCard";
import usePayStripeCardPayment from "@/hooks/use-pay-stripe-card-payment";
import { useCancelUserMembershipPlan } from "@/provider/UserMembershipPlansProvider";
import { UserContext } from "@/provider/UserContext";
import { FaStar } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UIComponent = () => {
  const router = useRouter();
  const { subscription, refetchUserData } = useContext(UserContext);
  console.log(subscription);

  const [selectedPeriod, setSelectedPeriod] = useState("MONTHLY");
  const [showCardElement, setShowCardElement] = useState(false);
  const [cardElementState, setCardElementState] = useState({
    errorMessage: "",
    complete: false,
  });
  const [cardPaymentState, setCardPaymentState] = useState({
    errorMessage: "",
  });

  const payStripeCardPayment = usePayStripeCardPayment();
  const cancelUserMembershipPlan = useCancelUserMembershipPlan();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  const handleStartNow = () => {
    setShowCardElement(true);
  };

  async function updateCreditAmount() {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await fetch("/api/credit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: 100,
          premium: "premium",
        }),
      });

      const res = await response.json();

      console.log('Update Status', res)

      if (res.success) {
        refetchUserData();
      } else {
        console.error("Failed to update credit amount:", res.error);
      }
    } catch (error) {
      console.error("Error updating credit amount:", error);
    }
  }

  const handlePremiumPay = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(
        "/api/membership/user_plans/payment_intent/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan_id: selectedPeriod === "MONTHLY" ? 3 : 4,
            userId: "globalUserInfoId", // Replace with actual user ID
            userEmail: "globalUserEmail", // Replace with actual user email
          }),
        }
      );

      const result = await response.json();
      if (!result.success)
        throw new Error(result.error || "Failed to create payment intent");

      const paymentIntent = result.data;

      const payResult = await payStripeCardPayment(
        {
          client_secret: paymentIntent.client_secret,
        },
        {
          name: "",
        }
      );

      if (
        payResult &&
        payResult.paymentIntent &&
        payResult.paymentIntent.status === "succeeded"
      ) {
        const confirmResponse = await fetch(
          "/api/membership/user_plans/payment_intent/confirm",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              payment_intent_id: payResult.paymentIntent.id,
              userId: "globalUserInfoId", // Replace with actual user ID
            }),
          }
        );

        const confirmResultStatus = await confirmResponse.json();
        if (confirmResultStatus.success !== true) {
          throw new Error(
            confirmResultStatus.error || "Failed to verify payment"
          );
        } else {
          setCardPaymentState({ errorMessage: "Payment successful!" });
          setShowCardElement(false);
          await updateCreditAmount()
        }
      }
    } catch (error) {
      setCardPaymentState({ errorMessage: error.message });
    }
  };

  const handleCancelPremium = async () => {
    try {
      await cancelUserMembershipPlan(subscription?.id);
      toast.success("Subscription cancelled successfully");
      await refetchUserData();
    } catch (error) {
      toast.success("Subscription cancelled successfully");
      alert("Failed to cancel subscription");
    }
  };

  return (
    <div className="bg-black text-white p-8">
      <h1 className="text-5xl font-bold text-blue-400 mb-8">Pricing</h1>

      <div className="flex justify-center mb-8">
        <button
          className={`px-6 py-2 ${
            selectedPeriod === "MONTHLY" ? "bg-blue-standard" : "bg-gray-800"
          } rounded-l-full`}
          onClick={() => setSelectedPeriod("MONTHLY")}
        >
          MONTHLY
        </button>
        <button
          className={`px-6 py-2 ${
            selectedPeriod === "ANNUALLY" ? "bg-blue-standard" : "bg-gray-800"
          } rounded-r-full`}
          onClick={() => setSelectedPeriod("ANNUALLY")}
        >
          ANNUALLY
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Free</h2>
          <p className="text-blue-400 mb-4">0 credits</p>
          <p className="text-3xl font-bold mb-4">
            €0<span className="text-sm font-normal">/month</span>
          </p>
          {!subscription?.exists && (
            <button className="w-full bg-gray-800 text-white py-2 rounded-full mb-4">
              Current Plan
            </button>
          )}
          <ul className="space-y-2 text-gray-400">
            <li>• Cancel anytime</li>
            <li>• Watermarks</li>
            <li>• Standard avatars</li>
            <li>• Max 5 mins per session</li>
          </ul>
        </div>

        {/* Premium Plan */}
        <div className="bg-gray-900 p-6 rounded-lg relative">
          {subscription?.exists && (
            <div className="absolute top-4 right-10 flex items-center gap-2 justify-start">
              <FaStar className="text-blue-starndard" />
              <p className="text-white">Current Plan</p>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-2">Premium</h2>
          <p className="text-blue-400 mb-4">100 credits</p>
          <p className="text-3xl font-bold mb-4">
            €{selectedPeriod === "MONTHLY" ? "15" : "144"}
            <span className="text-sm font-normal">
              /{selectedPeriod.toLowerCase() === "monthly" ? "month" : "year"}
            </span>
          </p>
          {subscription?.exists ? (
            <button
              className="w-full bg-red-500 text-white py-2 rounded-full mb-4"
              onClick={handleCancelPremium}
            >
              Cancel
            </button>
          ) : (
            <button
              className="w-full bg-blue-standard text-white py-2 rounded-full mb-4"
              onClick={handleStartNow}
            >
              Start now
            </button>
          )}
          <ul className="space-y-2 text-gray-400">
            <li>• Cancel anytime</li>
            <li>• No Watermarks</li>
            <li>• Premium avatars</li>
            <li>• 120 mins streaming</li>
          </ul>
        </div>
      </div>

      {showCardElement && !subscription?.exists && (
        <div className="mt-8 max-w-md mx-auto p-6 rounded-lg">
          <CardElement
            onChange={(e) => {
              setCardElementState({
                errorMessage: e.error ? e.error.message : "",
                complete: e.complete,
              });
              setCardPaymentState({ errorMessage: "" });
            }}
          />
          {(cardElementState.errorMessage || cardPaymentState.errorMessage) && (
            <p className="text-red-500 mt-2">
              {cardElementState.errorMessage || cardPaymentState.errorMessage}
            </p>
          )}
          <button
            className="w-full bg-blue-standard text-white py-2 rounded-full mt-4"
            onClick={handlePremiumPay}
            disabled={!cardElementState.complete}
          >
            Pay Now
          </button>
        </div>
      )}

      <div className="mt-12 bg-gray-900 p-8 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 text-left text-gray-400"></th>
              <th className="py-2 text-center text-gray-400">FREE</th>
              <th className="py-2 text-center text-gray-400">PREMIUM</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-gray-800">
              <td className="py-2">License</td>
              <td className="py-2 text-center">Personal</td>
              <td className="py-2 text-center">Personal</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2">Watermarks / Pop ups</td>
              <td className="py-2 text-center">✓</td>
              <td className="py-2 text-center">No</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2">Support</td>
              <td className="py-2 text-center">No</td>
              <td className="py-2 text-center">Yes</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2">Credits</td>
              <td className="py-2 text-center">0</td>
              <td className="py-2 text-center">100</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2">Re-useable credits</td>
              <td className="py-2 text-center">No</td>
              <td className="py-2 text-center">Yes</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2">Your own scanned avatar</td>
              <td className="py-2 text-center">No</td>
              <td className="py-2 text-center">No</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2">Voices</td>
              <td className="py-2 text-center">4</td>
              <td className="py-2 text-center">4</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2">Language</td>
              <td className="py-2 text-center">
                English, Spanish, Dutch, French, German, Chinese, Arabic,
                Japanese
              </td>
              <td className="py-2 text-center">
                English, Spanish, Dutch, French, German, Chinese, Arabic,
                Japanese
              </td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2">Uploading knowledge</td>
              <td className="py-2 text-center">Text/Prompt</td>
              <td className="py-2 text-center">PDF/DOC</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2">Website embedding</td>
              <td className="py-2 text-center">No</td>
              <td className="py-2 text-center">No</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </div>
  );
};

const PricingView = () => (
  <Stripe>
    <UIComponent />
  </Stripe>
);

export default PricingView;
