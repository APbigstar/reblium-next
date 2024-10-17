"use client";

import { useEffect, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";

import Stripe from "@/provider/Stripe";
import { UserContext } from "@/provider/UserContext";
import { useCancelUserMembershipPlan } from "@/provider/UserMembershipPlansProvider";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import usePayStripeCardPayment from "@/hooks/use-pay-stripe-card-payment";

import CardElement from "@/components/StripeCard";

const UIComponent = () => {
  const router = useRouter();
  const cancelUserMembershipPlan = useCancelUserMembershipPlan();
  const payStripeCardPayment = usePayStripeCardPayment();
  const {
    userInfo,
    credits,
    loading,
    isAuthenticated,
    subscription,
    refetchUserData,
  } = useContext(UserContext);
  const [showCardElement, setShowCardElement] = useState(false);
  const [cardElementState, setCardElementState] = useState({
    errorMessage: "",
    complete: false,
  });
  const [cardPaymentState, setCardPaymentState] = useState({
    errorMessage: "",
  });
  const [price, setPrice] = useState<number | null>(0);
  const [amount, setAmount] = useState<number | null>(0);
  const [isPaying, setIsPaying] = useState<boolean | null>(false);

  const DEV_ACCOUNT_ID = +(process.env.NEXT_PUBLIC_DEV_ACCOUNT_ID ?? 0);

  const getCreditsText = () => {
    if (!isAuthenticated || loading) return "Loading...";
    if (userInfo?.id === DEV_ACCOUNT_ID) return "Unlimited";
    return "Credits left: " + credits.toString();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  const getTierText = () => {
    if (!isAuthenticated || loading) return "Loading...";
    if (userInfo?.id === DEV_ACCOUNT_ID) return "Dev";
    if (
      subscription?.plan_id ===
        Number(process.env.NEXT_PUBLIC_MONTHLY_PREMIUM_SUBSCRIPTION_ID) ||
      subscription?.plan_id ===
        Number(process.env.NEXT_PUBLIC_YEARLY_PREMIUM_SUBSCRIPTION_ID)
    )
      return "Premium Plan";
    return "Free Plan";
  };

  const getNextPaymentDate = () => {
    if (!subscription?.created_at) return "";

    const createdDate = new Date(subscription.created_at);
    let nextPaymentDate = new Date(createdDate);

    if (
      subscription?.plan_id ===
      +process.env.NEXT_PUBLIC_MONTHLY_PREMIUM_SUBSCRIPTION_ID
    ) {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    } else if (
      subscription?.plan_id ===
      +process.env.NEXT_PUBLIC_YEARLY_PREMIUM_SUBSCRIPTION_ID
    ) {
      nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
    } else {
      return ""; // Return empty string if plan_id doesn't match
    }

    // Format the date as YYYY-MM-DD
    return nextPaymentDate.toISOString().split("T")[0];
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

  const handleStartNow = (amount, price) => {
    setShowCardElement(true);
    setAmount(amount);
    setPrice(price);
  };

  const handleCreditPay = async () => {
    try {
      setIsPaying(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("/api/credit/payment_intent/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          price: price,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to create payment intent");
      }

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
          "/api/credit/payment_intent/confirm",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              payment_intent_id: payResult.paymentIntent.id,
              price: price,
            }),
          }
        );

        const confirmResultStatus = await confirmResponse.json();
        if (confirmResultStatus.success !== true) {
          throw new Error(
            confirmResultStatus.error || "Failed to verify payment"
          );
        } else {
          setIsPaying(false);
          setCardPaymentState({ errorMessage: "Payment successful!" });
          setShowCardElement(false);
          toast.success(`Added ${amount} credits successfully`);
          refetchUserData();
        }
      }
    } catch (error) {
      console.error("Error in handleCreditPay:", error);
      toast.success("Failed to add credit");
      // Handle the error appropriately, e.g., show a user-friendly message
      throw error; // Re-throw if you want calling code to handle it
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6 px-[25px] pt-[60px]">
      {/* Details Section */}
      <div className="border border-[#FFFFFF] rounded-xl p-4">
        <h2 className="text-3xl mb-4 text-[#00cdff]">Details</h2>
        <p className="text-white indent-16">{userInfo?.name}</p>
        <p className="text-gray-500 indent-16">{userInfo?.email}</p>
        <p className="text-gray-500 indent-16">Password: ***********</p>
        <div className="flex flex-col items-center justify-center">
          <button className="bg-blue-standard text-white font-semibold rounded-lg px-4 py-2 mt-2 transition duration-300 w-[80%]">
            Change password
          </button>
          <button className="second-button-style text-white font-semibold rounded-lg px-4 py-2 mt-2 transition duration-300 w-[80%]">
            Reset password
          </button>
        </div>
      </div>

      {/* Premium Plan Section */}
      <div className="border border-[#FFFFFF] rounded-xl p-4">
        <h2 className="text-3xl mb-4 text-[#00cdff]">Details</h2>
        <button className="bg-blue-standard text-white font-semibold rounded-lg px-4 py-2 mt-2 transition duration-300 mb-4">
          {getTierText()}
        </button>
        {getTierText() !== "Dev" && (
          <>
            {getTierText() !== "Free Plan" && (
              <p className="text-white mb-4">
                Your next billing cycle starts on {getNextPaymentDate()}
              </p>
            )}

            <div className="flex flex-col items-center justify-center w-full">
              <button
                className="bg-blue-standard text-white font-semibold rounded-lg px-4 py-2 mt-2 transition duration-300 w-[80%]"
                onClick={() => router.push("/pricing")}
              >
                Change plan
              </button>
              {getTierText() !== "Free Plan" && (
                <button
                  className="second-button-style text-white font-semibold rounded-lg px-4 py-2 mt-2 transition duration-300 w-[80%]"
                  onClick={handleCancelPremium}
                >
                  Cancel plan
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Billing Section */}
      <div className="border border-[#FFFFFF] rounded-xl p-4">
        <h2 className="text-3xl mb-4 text-[#00cdff]">Billing</h2>
        <h3 className="uppercase text-sm mb-2 text-blue-starndard">
          Current plan
        </h3>
        <p className="text-white">Premium</p>
        <p className="text-white">€ 35 per month</p>
        <p className="text-white text-sm">
          Your plan renews on April 17th, 2024
        </p>
        <p className="text-white flex items-center mt-2">
          <CreditCard className="mr-2" size={16} /> •••• 0510
        </p>
        <h3 className="uppercase text-sm mt-4 mb-2 text-blue-starndard">
          Payment method
        </h3>
        <p className="text-white flex items-center">
          <CreditCard className="mr-2" size={16} /> •••• 0510
        </p>
        <p className="text-white text-sm">Expires 02/2029</p>
        <button className="text-white text-white mt-4">
          + Add payment method
        </button>
        <h3 className="uppercase text-sm mt-4 mb-2 text-blue-starndard">
          Billing and shipping information
        </h3>
        <p className="text-white">Email: khitano@gmail.com</p>
        <p className="text-white">Billing address: NL</p>
        <button className="text-white mt-2">Update information</button>
      </div>

      {/* Credits Section */}
      {getTierText() !== "Dev" && (
        <div className="border border-[#FFFFFF] rounded-xl p-4">
          <h2 className="text-3xl mb-4 text-[#00cdff]">Credits</h2>
          <p className="mb-4 text-white">{getCreditsText()}</p>
          <div className="flex flex-col items-center justify-center mt-8">
            <button
              className={`bg-blue-standard text-white font-semibold rounded-lg px-4 py-2 mt-2 transition duration-300 w-[80%] ${isPaying ? "pointer-events-none" : ""}`}
              onClick={() => handleStartNow(100, 12)}
            >
              Add 100 credits
            </button>
            <button
              className={`bg-blue-standard text-white font-semibold rounded-lg px-4 py-2 mt-2 transition duration-300 w-[80%] ${isPaying ? "pointer-events-none" : ""}`}
              onClick={() => handleStartNow(200, 30)}
            >
              Add 250 credits
            </button>
            <button
              className={`bg-blue-standard text-white font-semibold rounded-lg px-4 py-2 mt-2 transition duration-300 w-[80%] ${isPaying ? "pointer-events-none" : ""}`}
              onClick={() => handleStartNow(500, 60)}
            >
              Add 500 credits
            </button>
            <button
              className={`bg-blue-standard text-white font-semibold rounded-lg px-4 py-2 mt-2 transition duration-300 w-[80%] ${isPaying ? "pointer-events-none" : ""}`}
              onClick={() => handleStartNow(1000, 96)}
            >
              Add 1000 credits
            </button>
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
              {(cardElementState.errorMessage ||
                cardPaymentState.errorMessage) && (
                <p className="text-red-500 mt-2">
                  {cardElementState.errorMessage ||
                    cardPaymentState.errorMessage}
                </p>
              )}
              <button
                className={`w-full bg-blue-standard text-white py-2 rounded-full mt-4 ${
                  isPaying ? "pointer-events-none" : ""
                }`}
                onClick={handleCreditPay}
                disabled={!cardElementState.complete}
              >
                {isPaying ? "Paying..." : "Pay Now"}
              </button>
            </div>
          )}
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </div>
  );
};

export default function PricingDetailView() {
  return (
    <Stripe>
      <UIComponent />
    </Stripe>
  );
}
