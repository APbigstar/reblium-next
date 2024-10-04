import { useState } from 'react';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement forgot password logic here
    setMessage('Password reset link sent to your email.');
  };

  return (
    <>
      <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
        Reset your password
      </h1>
      <p className="mt-2">
        Please enter your email address. You will receive a link to create a new password via email.
      </p>
      <form className="mt-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-700">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full block bg-blue-standard text-white font-semibold rounded-lg px-4 py-3 mt-6"
        >
          Send Reset Link
        </button>
      </form>
      {message && (
        <div className="mt-4 text-sm text-green-500 text-center">{message}</div>
      )}
      <p className="mt-8">
        Remembered your password?{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onBackToLogin();
          }}
          className="text-blue-starndard font-semibold"
        >
          Log in
        </a>
      </p>
    </>
  );
}
