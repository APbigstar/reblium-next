'use client';

import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import SocialLoginButtons from './components/SocialLoginButtons';

export default function LoginView() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row h-screen items-center">
      <div className="bg-indigo-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen relative">
        <video
          src="/videos/login_video.mp4"
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
        ></video>
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={96}
          height={96}
          className="absolute top-0 right-0 m-4 max-h-24 cursor-pointer"
          onClick={() => router.push('/')}
        />
      </div>

      <div className="bg-white w-full md:max-w-md lg:max-w-full md:mx-auto md:mx-0 md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
        <div className="w-full h-100">
          <div className="block lg:hidden">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={96}
              height={96}
              className="mx-auto max-h-24 w-auto"
            />
          </div>

          {showForgotPassword ? (
            <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
          ) : (
            <>
              <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
              <hr className="my-6 border-gray-300 w-full" />
              <SocialLoginButtons />
            </>
          )}
        </div>
      </div>
    </div>
  );
}