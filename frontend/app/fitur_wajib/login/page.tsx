"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { users } from "../data/dummydata";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
      setError("Email atau password salah");
      return;
    }

    localStorage.setItem("user", JSON.stringify(foundUser));
    if (foundUser.role === "staff") {
      router.push("/fitur_wajib/dashboard");
    } else {
      router.push("/fitur_wajib/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-white text-2xl">
            ✈
          </div>

          <h1 className="mt-4 text-2xl font-semibold">
            Selamat Datang
          </h1>
          <p className="text-gray-500 mb-6">
            Masuk ke akun AeroMiles Anda
          </p>

          <form
            onSubmit={handleLogin}
            className="bg-white p-6 rounded-xl shadow-md w-[350px] text-left"
          >
            <h2 className="font-semibold mb-1">Login</h2>
            <p className="text-sm text-gray-500 mb-4">
              Coba:
              <br />
              admin@aero.com / 123456 (Staff)
              <br />
              john@example.com / 123456 (Member)
            </p>

            {error && (
              <p className="text-red-500 text-sm mb-2">{error}</p>
            )}

            <label className="text-sm">Email</label>
            <input
              type="email"
              className="w-full mt-1 mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="text-sm">Password</label>
            <input
              type="password"
              className="w-full mt-1 mb-4 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-white py-2 rounded-md hover:bg-[var(--color-primary-dark)]"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}