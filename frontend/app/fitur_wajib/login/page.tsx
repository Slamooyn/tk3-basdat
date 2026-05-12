"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    const result = await loginUser({ email, password });
    setLoading(false);

    if (result.success) {
      localStorage.setItem("user", JSON.stringify(result.user));
      router.push("/fitur_wajib/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-white text-2xl">
            ✈
          </div>

          <h1 className="mt-4 text-2xl font-semibold">Selamat Datang</h1>
          <p className="text-gray-500 mb-6">Masuk ke akun AeroMiles Anda</p>

          <form
            onSubmit={handleLogin}
            className="bg-white p-6 rounded-xl shadow-md w-[350px] text-left"
          >
            <h2 className="font-semibold mb-4">Login</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
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
              disabled={loading}
              className="w-full bg-[var(--color-primary)] text-white py-2 rounded-md hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              {loading ? "Masuk..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}