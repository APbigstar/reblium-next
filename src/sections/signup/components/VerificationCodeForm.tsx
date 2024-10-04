import React, { useState } from 'react';

interface VerificationCodeFormProps {
  onVerificationSuccess: () => void;
  signupMessage: string;
  setSignupMessage: (message: string) => void;
}

const VerificationCodeForm: React.FC<VerificationCodeFormProps> = ({ 
  onVerificationSuccess, 
  signupMessage, 
  setSignupMessage 
}) => {
  const [verificationCode, setVerificationCode] = useState<string>('');

  const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSignupMessage(data.message);
        onVerificationSuccess();
      } else {
        throw new Error(data.error || "Verification failed");
      }
    } catch (error) {
      if (error instanceof Error) {
        setSignupMessage(error.message);
      } else {
        setSignupMessage("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex flex-col justify-center">
      <h2 className="text-2xl font-semibold mb-6">Enter Verification Code</h2>
      <p className="mb-4">Please enter the 5-digit code sent to your email.</p>
      <form onSubmit={handleVerificationSubmit} className="space-y-4 text-left">
        <div>
          <label
            htmlFor="verificationCode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Verification Code
          </label>
          <input
            type="text"
            id="verificationCode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            placeholder="Enter 5-digit code"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-standard"
        >
          Verify
        </button>
      </form>
      {signupMessage && (
        <p className={`mt-4 text-sm ${signupMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {signupMessage}
        </p>
      )}
    </div>
  );
};

export default VerificationCodeForm;