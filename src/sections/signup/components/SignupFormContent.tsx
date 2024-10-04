import React, { useState } from 'react';
import { validateEmail, validatePassword } from '@/utils/auth_validation';

interface SignupFormContentProps {
  onSignupSuccess: (email: string, name: string) => void;
  signupMessage: string;
}

const SignupFormContent: React.FC<SignupFormContentProps> = ({ onSignupSuccess, signupMessage }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onSignupSuccess(email, name);
      } else {
        throw new Error(data.error || "An error occurred during sign up.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setPasswordError(error.message);
      } else {
        setPasswordError("An unexpected error occurred");
      }
    }
  };

  return (
    <>
      <h2 className="text-2xl font-semibold mb-8">Create your account</h2>
      <form onSubmit={handleSignupSubmit} className="space-y-6 text-left">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            placeholder="Enter your full name"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            placeholder="demo@reblium.com"
            required
          />
          {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            required
          />
          {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-standard"
        >
          Sign Up
        </button>
      </form>
      {signupMessage && (
        <p className={`mt-4 text-sm ${signupMessage.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
          {signupMessage}
        </p>
      )}
      <p className="mt-4 text-xs text-gray-500">
        By creating an account, you agree to our Privacy Policy, Terms and
        Conditions and End User License Agreement.
      </p>
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?
        <a href="/" className="text-blue-starndard"> Log in</a>
      </p>
    </>
  );
};

export default SignupFormContent;