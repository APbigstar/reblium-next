import React from 'react';

interface VerificationLinkSentProps {
  email: string;
  name: string;
  onRequestCode: () => void;
}

const VerificationLinkSent: React.FC<VerificationLinkSentProps> = ({ email, name, onRequestCode }) => {
  const requestVerificationCode = async () => {
    try {
      const response = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (response.ok) {
        onRequestCode();
      } else {
        throw new Error(data.error || "Failed to send verification code.");
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex flex-col justify-center">
      <h2 className="text-2xl font-semibold mb-8">Verify Your Email</h2>
      <p className="mb-4">
        We've sent a verification link to your email. Please check your
        inbox and click the link to verify your account.
      </p>
      <p className="mb-4">
        Didn't receive the email? Check your spam folder or click the button
        below to receive a verification code instead.
      </p>
      <button
        onClick={requestVerificationCode}
        className="w-full py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-standard"
      >
        Request Verification Code
      </button>
    </div>
  );
};

export default VerificationLinkSent;