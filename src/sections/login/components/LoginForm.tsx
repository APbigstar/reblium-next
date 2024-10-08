import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthAndUser } from "@/hooks/useAuthAndUser";
import IconInput from "./IconInput";

import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";

interface LoginFormProps {
  onForgotPassword: () => void;
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const router = useRouter();
  const { login } = useAuthAndUser();
  const { isAuthenticated } = useAuthAndUser();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/profile");
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
      <h1 className="text-xl md:text-3xl font-bold leading-tight mt-12 uppercase text-white text-center">
        Enter your <br /> reblium account
      </h1>
      <form className="mt-6" onSubmit={handleLogin}>
        <IconInput
          type="email"
          id="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          placeholder="Enter Email Address"
          icon={MdEmail}
        />
        <IconInput
          type="password"
          id="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          placeholder="Enter Password"
          icon={RiLockPasswordLine}
        />
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 bg-blue-standard bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 text-sm font-medium text-white"
          >
            Remember me
          </label>
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
      <div className="text-center mt-4">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onForgotPassword();
          }}
          className="text-sm font-semibold text-gray-700 hover:text-blue-700 focus:text-blue-700 text-white"
        >
          Forgot Password?
        </a>
      </div>
    </>
  );
}
