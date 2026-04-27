"use client";

import { useEffect, useState } from "react";
import { transactions } from "../data/dummydata";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-6xl mx-auto">
        {/* HEADER */}
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500 mb-6">
          Selamat datang, {user.name}
        </p>

        {/* INFO */}
        <div className="bg-white rounded-xl shadow p-6 grid grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500">Nama Lengkap:</p>
            <p className="font-medium">{user.name}</p>

            <p className="text-sm text-gray-500 mt-3">Kewarganegaraan:</p>
            <p>{user.country}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email:</p>
            <p>{user.email}</p>

            <p className="text-sm text-gray-500 mt-3">Tanggal Lahir:</p>
            <p>{user.birth}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Telepon:</p>
            <p>{user.phone}</p>

            {user.role === "member" && (
              <>
                <p className="text-sm text-gray-500 mt-3">
                  Tanggal Bergabung:
                </p>
                <p>{user.join}</p>
              </>
            )}
          </div>
        </div>

        {/* 🔥 MEMBER DASHBOARD */}
        {user.role === "member" && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-500">Nomor Member</p>
                <p className="font-semibold">{user.memberId}</p>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-500">Tier</p>
                <span className="bg-yellow-400 text-xs px-2 py-1 rounded text-white">
                  {user.tier}
                </span>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-500">Total Miles</p>
                <p className="font-semibold">
                  {user.totalMiles?.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-500">Award Miles</p>
                <p className="font-semibold">
                  {user.awardMiles?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* TRANSAKSI */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-semibold mb-4">
                5 Transaksi Terbaru
              </h2>

              <div className="space-y-3">
                {transactions.map((trx, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex gap-3 items-center">
                      <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                        {trx.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {trx.date}
                      </span>
                    </div>

                    <span
                      className={`font-medium ${
                        trx.amount < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {trx.amount > 0 ? "+" : ""}
                      {trx.amount.toLocaleString()} miles
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 🔥 STAFF DASHBOARD */}
        {user.role === "staff" && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-500">ID Staff</p>
                <p className="font-semibold">{user.staffId}</p>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-500">Maskapai</p>
                <p className="font-semibold">{user.airline}</p>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-500">Klaim Menunggu</p>
                <p className="font-semibold">2</p>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-500">Klaim Disetujui</p>
                <p className="font-semibold">1</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-500">Klaim Ditolak</p>
                <p className="font-semibold text-red-500">1</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}