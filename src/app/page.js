"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push("/auth");
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 min-h-screen flex flex-col items-center justify-center">
      <main className="flex flex-col sm:flex-row items-center justify-center gap-10 p-8 rounded-lg shadow-md">
        <div className="flex justify-center items-center p-4">
          <Image
            src="/logos/dg_symbol_white.png"
            alt="Company Logo"
            width={250}
            height={250}
            priority
          />
        </div>
        <div className="flex flex-col items-center sm:items-start gap-6">
          <input
            type="text"
            placeholder="Username"
            className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full sm:w-80 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 flex justify-center items-center"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            ) : (
              "Login"
            )}
          </button>
        </div>
      </main>
      <footer className="text-white text-center mt-8">
        Copyright © 2024 ManyCoreSoftCo., Ltd.
      </footer>
    </div>
  );
}
