"use client";

import { useEffect, useState } from "react";

type AuthMode = "login" | "register";

type AuthUser = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
};

type AuthModalProps = {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
  onSuccess: (token: string, user: AuthUser) => void;
};

const API_URL = "http://localhost:5000";

export default function AuthModal({
  open,
  mode,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [authMode, setAuthMode] = useState<AuthMode>(mode);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthMode(mode);
  }, [mode]);

  if (!open) {
    return null;
  }

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Email and password are required");
      return;
    }

    if (
      authMode === "register" &&
      (!firstName.trim() || !lastName.trim())
    ) {
      alert("First name and last name are required");
      return;
    }

    setLoading(true);

    try {
      const body =
        authMode === "login"
          ? {
              email: email.trim(),
              password,
            }
          : {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              email: email.trim(),
              password,
            };

      const response = await fetch(
        authMode === "login"
          ? `${API_URL}/api/auth/login`
          : `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.details ||
            "Authentication failed"
        );
      }

      localStorage.setItem(
        "musicstream_token",
        data.token
      );

      localStorage.setItem(
        "musicstream_user",
        JSON.stringify(data.user)
      );

      onSuccess(data.token, data.user);

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");

      onClose();

      alert(
        authMode === "login"
          ? "Login successful!"
          : "Registration successful!"
      );
    } catch (error) {
      console.error("Authentication error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#111111] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {authMode === "login"
                ? "Welcome back"
                : "Create account"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {authMode === "login"
                ? "Login to MusicStream"
                : "Join MusicStream today"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-gray-700 px-3 py-1 text-gray-400 hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        {authMode === "register" && (
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) =>
                setFirstName(e.target.value)
              }
              className="rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 text-sm outline-none focus:border-gray-400"
            />

            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) =>
                setLastName(e.target.value)
              }
              className="rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 text-sm outline-none focus:border-gray-400"
            />
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-3 w-full rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 text-sm outline-none focus:border-gray-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          className="mt-3 w-full rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 text-sm outline-none focus:border-gray-400"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 w-full rounded-full bg-white py-3 font-semibold text-black hover:bg-gray-200 disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : authMode === "login"
            ? "Login"
            : "Create Account"}
        </button>

        <div className="mt-5 text-center text-sm text-gray-500">
          {authMode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            onClick={() =>
              setAuthMode(
                authMode === "login"
                  ? "register"
                  : "login"
              )
            }
            className="ml-2 text-white hover:underline"
          >
            {authMode === "login"
              ? "Register"
              : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}