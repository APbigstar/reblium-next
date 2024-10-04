'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LeftPanel from './components/LeftPanel';
import SignupFormContent from './components/SignupFormContent';
import VerificationLinkSent from './components/VerificationLinkSent';
import VerificationCodeForm from './components/VerificationCodeForm';

export type FormState = 'signup' | 'verificationLinkSent' | 'verificationCode';

const SignupForm: React.FC = () => {
  const [formState, setFormState] = useState<FormState>('signup');
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [signupMessage, setSignupMessage] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const verificationFailed = localStorage.getItem("verificationFailed");
    if (verificationFailed === "true") {
      setSignupMessage("Email verification failed. Please try signing up again.");
      localStorage.removeItem("verificationFailed");
    }
  }, []);

  const handleSignupSuccess = (email: string, name: string) => {
    setEmail(email);
    setName(name);
    setFormState('verificationLinkSent');
  };

  const handleRequestCode = () => {
    setFormState('verificationCode');
  };

  const handleVerificationSuccess = () => {
    setSignupMessage("Verification successful. Redirecting to login...");
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  return (
    <div id="signUpFormSection" className="h-screen">
      <div className="bg-white rounded-lg shadow-xl flex w-full h-full overflow-hidden">
        <LeftPanel />
        <div className="w-full md:w-1/2 p-12 justify-center flex flex-col" id="signupForm">
          {formState === 'signup' && (
            <SignupFormContent onSignupSuccess={handleSignupSuccess} signupMessage={signupMessage} />
          )}
          {formState === 'verificationLinkSent' && (
            <VerificationLinkSent email={email} name={name} onRequestCode={handleRequestCode} />
          )}
          {formState === 'verificationCode' && (
            <VerificationCodeForm onVerificationSuccess={handleVerificationSuccess} signupMessage={signupMessage} setSignupMessage={setSignupMessage} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupForm;