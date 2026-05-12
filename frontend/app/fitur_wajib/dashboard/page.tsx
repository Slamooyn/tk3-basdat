"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "@/app/actions/auth";
import { FiUser, FiAward, FiRepeat, FiClock, FiCheckCircle, FiXCircle, FiUsers } from "react-icons/fi";
import { FaPlaneDeparture } from "react-icons/fa";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      getDashboardData(parsed.email, parsed.role).then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      });
    }
  }, []);

  if (!user || loading) return null;

  const namaLengkap = `${data?.first_mid_name ?? ""} ${data?.last_name ?? ""}`.trim();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-6xl mx-auto">
        {/* HEADER */}
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500 mb-6">Selamat datang, {namaLengkap}</p>

        {/* INFO */}
        <div className="bg-white rounded-xl shadow p-6 grid grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500">Nama Lengkap:</p>
            <p className="font-medium">{namaLengkap}</p>
            <p className="text-sm text-gray-500 mt-3">Kewarganegaraan:</p>
            <p>{data?.kewarganegaraan}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email:</p>
            <p>{user.email}</p>
            <p className="text-sm text-gray-500 mt-3">Tanggal Lahir:</p>
            <p>{data?.tanggal_lahir ? new Date(data.tanggal_lahir).toLocaleDateString("id-ID") : "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Telepon:</p>
            <p>{data?.country_code} {data?.mobile_number}</p>
            {user.role === "member" && (
              <>
                <p className="text-sm text-gray-500 mt-3">Tanggal Bergabung:</p>
                <p>{data?.tanggal_bergabung ? new Date(data.tanggal_bergabung).toLocaleDateString("id-ID") : "-"}</p>
              </>
            )}
          </div>
        </div>

        {/* MEMBER DASHBOARD */}
        {user.role === "member" && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <FiUser className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nomor Member</p>
                  <p className="font-semibold">{data?.nomor_member ?? "-"}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <FiAward className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tier</p>
                  <span className="bg-yellow-400 text-xs px-2 py-1 rounded text-white font-medium">
                    {data?.nama_tier ?? "-"}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaPlaneDeparture className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Miles</p>
                  <p className="font-semibold">{data?.total_miles?.toLocaleString() ?? 0}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FiRepeat className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Award Miles</p>
                  <p className="font-semibold">{data?.award_miles?.toLocaleString() ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-semibold mb-4">5 Transaksi Terbaru</h2>
              <div className="space-y-3">
                {data?.transaksi?.length > 0 ? (
                  data.transaksi.map((trx: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div className="flex gap-3 items-center">
                        <span className="bg-gray-200 px-2 py-1 rounded text-xs">{trx.type}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(trx.timestamp).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <span className={`font-medium ${trx.amount < 0 ? "text-red-500" : "text-green-500"}`}>
                        {trx.amount > 0 ? "+" : ""}{Number(trx.amount).toLocaleString()} miles
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">Belum ada transaksi.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* STAFF DASHBOARD */}
        {user.role === "staff" && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FiUsers className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">ID Staff</p>
                  <p className="font-semibold">{data?.id_staf ?? "-"}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaPlaneDeparture className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Maskapai</p>
                  <p className="font-semibold">{data?.nama_maskapai ?? "-"}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <FiClock className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Klaim Menunggu</p>
                  <p className="font-semibold">{data?.klaim_menunggu ?? 0}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FiCheckCircle className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Klaim Disetujui</p>
                  <p className="font-semibold">{data?.klaim_disetujui ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3 col-span-1">
                <div className="bg-red-100 p-3 rounded-lg">
                  <FiXCircle className="text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Klaim Ditolak</p>
                  <p className="font-semibold">{data?.klaim_ditolak ?? 0}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}