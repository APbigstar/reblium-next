import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthAndUser } from "@/hooks/useAuthAndUser";

interface LoginFormProps {
  onForgotPassword: () => void;
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const router = useRouter();
  const { login } = useAuthAndUser();
  const {isAuthenticated} = useAuthAndUser();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard/discover');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoginMessage("Login successful!");
        localStorage.setItem("user_email", data.email);
        localStorage.setItem("user_id", data.userId);
        console.log(data.userId);
        login(data.token);
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      setLoginMessage((error as Error).message);
    }
  };

  return (
    <>
      <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
        Log in to your account
      </h1>
      <form className="mt-6" onSubmit={handleLogin}>
        <div>
          <label htmlFor="email" className="block text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email Address"
            className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
            required
            autoFocus
            autoComplete="email"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="password" className="block text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
            required
            autoComplete="current-password"
          />
        </div>
        <div className="text-right mt-2">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onForgotPassword();
            }}
            className="text-sm font-semibold text-gray-700 hover:text-blue-700 focus:text-blue-700"
          >
            Forgot Password?
          </a>
        </div>
        <div className="flex items-center flex-col gap-2">
          <button
            type="submit"
            className="w-full block bg-blue-standard text-white font-semibold rounded-lg px-4 py-3 mt-6"
          >
            Log In
          </button>
          <button
            type="button"
            className="w-full block second-button-style font-semibold rounded-lg px-4 py-3"
            onClick={() => router.push("/trial")}
          >
            Free Trial
          </button>
        </div>
      </form>
      {loginMessage && (
        <div
          className={`mt-4 text-sm ${
            loginMessage.includes("successful")
              ? "text-blue-starndard"
              : "text-red-600"
          } text-center`}
        >
          {loginMessage}
        </div>
      )}
      <div className="mt-4 text-center text-xs text-gray-600">
        By logging in, you agree to our{" "}
        <a
          href="https://www.reblium.com/privacy-policy"
          className="text-blue-starndard"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>
        ,{" "}
        <a
          href="https://www.termsfeed.com/live/ce41436e-bc47-4730-988d-d061c3de1774"
          className="text-blue-starndard"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms and Conditions
        </a>{" "}
        and{" "}
        <a
          href="https://www.reblium.com/termsandconditions"
          className="text-blue-starndard"
          target="_blank"
          rel="noopener noreferrer"
        >
          End-User License Agreement
        </a>
        .
      </div>
    </>
  );
}
