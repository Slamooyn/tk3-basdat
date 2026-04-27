"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [role, setRole] = useState<"member" | "staff">("member");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex flex-1 items-center justify-center py-10">
        <div className="text-center w-full max-w-xl">
          <div className="w-16 h-16 mx-auto bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-white text-2xl">
            ✈
          </div>

          <h1 className="mt-4 text-2xl font-semibold">
            Daftar Akun Baru
          </h1>

          <div className="bg-white p-6 rounded-xl shadow-md text-left mt-6">
            <h2 className="font-semibold mb-1">Registrasi</h2>

            {/* 🔥 SWITCH */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              <button
                onClick={() => setRole("member")}
                className={`flex-1 py-2 rounded-lg text-sm transition ${
                  role === "member"
                    ? "bg-white shadow font-medium"
                    : "text-gray-500"
                }`}
              >
                Member
              </button>

              <button
                onClick={() => setRole("staff")}
                className={`flex-1 py-2 rounded-lg text-sm transition ${
                  role === "staff"
                    ? "bg-white shadow font-medium"
                    : "text-gray-500"
                }`}
              >
                Staff
              </button>
            </div>

            {/* EMAIL */}
            <label className="text-sm">Email *</label>
            <input className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" />

            {/* PASSWORD */}
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Password"
                className="px-3 py-2 border rounded-md"
              />
              <input
                placeholder="Konfirmasi Password"
                className="px-3 py-2 border rounded-md"
              />
            </div>

            <hr className="my-4" />

            {/* DATA PRIBADI */}
            <p className="text-sm font-semibold mb-2">Data Pribadi</p>

            <input
              placeholder="Nama Depan"
              className="w-full mb-3 px-3 py-2 border rounded-md"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Nama Belakang"
                className="px-3 py-2 border rounded-md"
              />
              <select className="px-3 py-2 border rounded-md">
                <option>Pilih negara</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <select className="px-3 py-2 border rounded-md">
                <option>+62</option>
              </select>
              <input
                placeholder="Nomor HP"
                className="px-3 py-2 border rounded-md"
              />
            </div>

            <input
              type="date"
              className="w-full mt-3 px-3 py-2 border rounded-md"
            />

            {/* 🔥 CONDITIONAL STAFF */}
            {role === "staff" && (
              <>
                <hr className="my-4" />
                <p className="text-sm font-semibold mb-2">Data Staf</p>

                <select className="w-full px-3 py-2 border rounded-md">
                  <option>Pilih maskapai</option>
                </select>
              </>
            )}

            <button className="w-full mt-6 bg-[var(--color-primary)] text-white py-2 rounded-md hover:bg-[var(--color-primary-dark)]">
              Daftar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}