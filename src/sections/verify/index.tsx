"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const VerifyEmail: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failure'>('verifying');
  const [message, setMessage] = useState<string>('Please wait while we verify your email...');

  useEffect(() => {
    const verifyEmail = async (token: string) => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setVerificationStatus('success');
          setMessage(data.message);
          localStorage.removeItem("verificationPending");
          setTimeout(() => router.push('/'), 2000);
        } else {
          throw new Error(data.error || "Verification failed");
        }
      } catch (error) {
        setVerificationStatus('failure');
        setMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
        localStorage.setItem("verificationFailed", "true");
        localStorage.removeItem("verificationPending");
        setTimeout(() => router.push('/signup'), 2000);
      }
    };

    const token = searchParams.get('token');

    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('failure');
      setMessage('Invalid verification link.');
      localStorage.setItem("verificationFailed", "true");
      localStorage.removeItem("verificationPending");
      setTimeout(() => router.push('/'), 2000);
    }
  }, [router]);

  return (
    <>
      <div className="bg-gray-100 flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">
            {verificationStatus === 'verifying' ? 'Verifying Your Email' :
             verificationStatus === 'success' ? 'Email Verified' : 'Verification Failed'}
          </h1>
          <p className="text-center mb-4">{message}</p>
          {verificationStatus === 'verifying' && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          )}
          {verificationStatus !== 'verifying' && (
            <div className={`mt-4 text-center ${verificationStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              <p>{message}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;