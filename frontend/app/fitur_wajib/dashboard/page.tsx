"use client";

import { useEffect, useState } from "react";
import { transactions } from "../data/dummydata";
import { FiUser, FiAward } from "react-icons/fi";
import { FaPlaneDeparture } from "react-icons/fa";
import { FiRepeat } from "react-icons/fi";
import { FiClock } from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";
import { FiXCircle } from "react-icons/fi";
import { FiUsers } from "react-icons/fi";

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
              {/* MEMBER ID */}
              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <FiUser className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nomor Member</p>
                  <p className="font-semibold">{user.memberId}</p>
                </div>
              </div>

              {/* TIER */}
              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <FiAward className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tier</p>
                  <span className="bg-yellow-400 text-xs px-2 py-1 rounded text-white font-medium">
                    {user.tier}
                  </span>
                </div>
              </div>

              {/* TOTAL MILES */}
              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaPlaneDeparture className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Miles</p>
                  <p className="font-semibold">
                    {user.totalMiles?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* AWARD MILES */}
              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FiRepeat className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Award Miles</p>
                  <p className="font-semibold">
                    {user.awardMiles?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
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
                      className={`font-medium ${trx.amount < 0
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
        {user.role === "staff" && (
          <>
<div className="grid grid-cols-4 gap-4 mb-6">
  {/* ID STAFF */}
  <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
    <div className="bg-blue-100 p-3 rounded-lg">
      <FiUsers className="text-blue-600" />
    </div>
    <div>
      <p className="text-xs text-gray-500">ID Staff</p>
      <p className="font-semibold">{user.staffId}</p>
    </div>
  </div>

  {/* MASKAPAI */}
  <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
    <div className="bg-blue-100 p-3 rounded-lg">
      <FaPlaneDeparture className="text-blue-600" />
    </div>
    <div>
      <p className="text-xs text-gray-500">Maskapai</p>
      <p className="font-semibold">{user.airline}</p>
    </div>
  </div>

  {/* MENUNGGU */}
  <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
    <div className="bg-yellow-100 p-3 rounded-lg">
      <FiClock className="text-yellow-600" />
    </div>
    <div>
      <p className="text-xs text-gray-500">Klaim Menunggu</p>
      <p className="font-semibold">2</p>
    </div>
  </div>

  {/* DISETUJUI */}
  <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
    <div className="bg-green-100 p-3 rounded-lg">
      <FiCheckCircle className="text-green-600" />
    </div>
    <div>
      <p className="text-xs text-gray-500">Klaim Disetujui</p>
      <p className="font-semibold">1</p>
    </div>
  </div>
</div>

{/* BARIS KEDUA */}
<div className="grid grid-cols-4 gap-4">
  <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3 col-span-1">
    <div className="bg-red-100 p-3 rounded-lg">
      <FiXCircle className="text-red-600" />
    </div>
    <div>
      <p className="text-xs text-gray-500">Klaim Ditolak</p>
      <p className="font-semibold">1</p>
    </div>
  </div>
</div>
          </>
        )}
      </div>
    </div>
  );
}