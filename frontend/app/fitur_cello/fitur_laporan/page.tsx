"use client";

import { useState } from "react";

const dummyStaf = {
  email: "admin@aeromiles.com",
  nama: "Mr. Admin Aero",
  id_staf: "S0001",
};

type TipeTransaksi = "Transfer" | "Redeem" | "Package" | "Klaim";

interface Transaksi {
  id: number;
  tipe: TipeTransaksi;
  member: string;
  email: string;
  miles: number;
  waktu: string;
  klaim_disetujui?: boolean;
}

const initialTransaksi: Transaksi[] = [
  { id: 1, tipe: "Transfer", member: "John W. Doe", email: "john@example.com", miles: -5000, waktu: "2025-01-15 10:30", klaim_disetujui: false },
  { id: 2, tipe: "Redeem", member: "John W. Doe", email: "john@example.com", miles: -3000, waktu: "2025-01-20 16:00", klaim_disetujui: false },
  { id: 3, tipe: "Package", member: "Jane Smith", email: "jane@example.com", miles: 5000, waktu: "2025-02-01 09:15", klaim_disetujui: false },
  { id: 4, tipe: "Klaim", member: "Budi A. Santoso", email: "budi@example.com", miles: 2500, waktu: "2025-02-05 11:45", klaim_disetujui: true },
  { id: 5, tipe: "Transfer", member: "Budi A. Santoso", email: "budi@example.com", miles: -2000, waktu: "2025-02-10 14:00", klaim_disetujui: false },
  { id: 6, tipe: "Package", member: "John W. Doe", email: "john@example.com", miles: 10000, waktu: "2025-03-01 08:00", klaim_disetujui: false },
];

const topMemberData = [
  { rank: 1, nama: "John W. Doe", email: "john@example.com", totalMiles: 18000, jumlahTransaksi: 3 },
  { rank: 2, nama: "Jane Smith", email: "jane@example.com", totalMiles: 5000, jumlahTransaksi: 1 },
  { rank: 3, nama: "Budi A. Santoso", email: "budi@example.com", totalMiles: 4500, jumlahTransaksi: 2 },
];

const TIPE_OPTIONS: (TipeTransaksi | "Semua")[] = ["Semua", "Transfer", "Redeem", "Package", "Klaim"];

const tipeIcon: Record<TipeTransaksi, string> = {
  Transfer: "⇄",
  Redeem: "🎁",
  Package: "🛒",
  Klaim: "✈",
};

export default function LaporanTransaksi() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>(initialTransaksi);
  const [activeTab, setActiveTab] = useState<"riwayat" | "top">("riwayat");
  const [filterTipe, setFilterTipe] = useState<TipeTransaksi | "Semua">("Semua");
  const [filterMember, setFilterMember] = useState("");
  const [filterTglDari, setFilterTglDari] = useState("");
  const [filterTglSampai, setFilterTglSampai] = useState("");
  const [confirmHapus, setConfirmHapus] = useState<Transaksi | null>(null);

  const totalMilesBeredar = 27500;
  const totalRedeemBulanIni = transaksi
    .filter((t) => t.tipe === "Redeem" && t.waktu.startsWith("2025-01"))
    .reduce((acc, t) => acc + Math.abs(t.miles), 0);
  const totalKlaimDisetujui = transaksi
    .filter((t) => t.tipe === "Klaim" && t.klaim_disetujui)
    .reduce((acc, t) => acc + t.miles, 0);

  const filtered = transaksi.filter((t) => {
    const matchTipe = filterTipe === "Semua" || t.tipe === filterTipe;
    const matchMember =
      !filterMember ||
      t.member.toLowerCase().includes(filterMember.toLowerCase()) ||
      t.email.toLowerCase().includes(filterMember.toLowerCase());
    const matchDari = !filterTglDari || t.waktu >= filterTglDari;
    const matchSampai = !filterTglSampai || t.waktu <= filterTglSampai + " 99";
    return matchTipe && matchMember && matchDari && matchSampai;
  });

  function hapusTransaksi(item: Transaksi) {
    if (item.tipe === "Klaim" && item.klaim_disetujui) return;
    setConfirmHapus(item);
  }

  function konfirmasiHapus() {
    if (!confirmHapus) return;
    setTransaksi((prev) => prev.filter((t) => t.id !== confirmHapus.id));
    setConfirmHapus(null);
  }

  function canDelete(t: Transaksi) {
    return !(t.tipe === "Klaim" && t.klaim_disetujui);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#0f1b35] text-white px-6 py-3 flex items-center gap-5 text-sm flex-wrap">
        <span className="font-bold text-base tracking-wide mr-2">✈ AeroMiles</span>
        <span className="text-gray-400 text-xs border-r border-gray-600 pr-4">Dashboard</span>
        {["Kelola Member", "Kelola Klaim", "Kelola Hadiah", "Kelola Mitra"].map((item) => (
          <a key={item} href="#" className="text-gray-300 hover:text-white transition-colors">
            {item}
          </a>
        ))}
        <a href="#" className="text-white font-semibold border-b border-white pb-0.5">
          Laporan Transaksi
        </a>
        <a href="#" className="text-gray-300 hover:text-white transition-colors">
          Pengaturan Profil
        </a>
        <a href="#" className="ml-auto text-red-400 hover:text-red-300 transition-colors">
          ⎋ Logout
        </a>
      </nav>
      <div className="bg-[#0f1b35] text-gray-400 text-xs px-6 pb-2">
        Masuk sebagai{" "}
        <span className="text-blue-400 font-medium">{dummyStaf.nama}</span> · Staff
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Laporan & Riwayat Transaksi</h1>
        <div className="grid grid-cols-3 gap-4 mb-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <span className="text-2xl">📈</span>
            <div>
              <p className="text-xs text-gray-500">Total Miles Beredar</p>
              <p className="text-xl font-bold text-gray-800">
                {totalMilesBeredar.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="text-xs text-gray-500">Total Redeem Bulan Ini</p>
              <p className="text-xl font-bold text-gray-800">
                {totalRedeemBulanIni.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-xs text-gray-500">Total Klaim Disetujui</p>
              <p className="text-xl font-bold text-gray-800">
                {totalKlaimDisetujui.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 mb-5 border-b border-gray-200">
          {(["riwayat", "top"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                activeTab === tab
                  ? "bg-white border border-b-white border-gray-200 text-gray-800 -mb-px"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "riwayat" ? "Riwayat Transaksi" : "Top Member"}
            </button>
          ))}
        </div>

        {activeTab === "riwayat" && (
          <>
            <div className="flex flex-wrap gap-3 mb-4">
              <select
                value={filterTipe}
                onChange={(e) => setFilterTipe(e.target.value as TipeTransaksi | "Semua")}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {TIPE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o === "Semua" ? "Semua Tipe" : o}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Cari nama / email member..."
                value={filterMember}
                onChange={(e) => setFilterMember(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[200px]"
              />
              <input
                type="date"
                value={filterTglDari}
                onChange={(e) => setFilterTglDari(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <span className="text-gray-400 self-center text-sm">s/d</span>
              <input
                type="date"
                value={filterTglSampai}
                onChange={(e) => setFilterTglSampai(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {(filterTipe !== "Semua" || filterMember || filterTglDari || filterTglSampai) && (
                <button
                  onClick={() => { setFilterTipe("Semua"); setFilterMember(""); setFilterTglDari(""); setFilterTglSampai(""); }}
                  className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-white"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Tipe</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Member</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Miles</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Waktu</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400">
                        Tidak ada data transaksi
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => (
                      <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-gray-700">
                            <span className="text-base">{tipeIcon[t.tipe]}</span>
                            {t.tipe}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{t.member}</p>
                          <p className="text-xs text-gray-400">{t.email}</p>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            t.miles > 0 ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {t.miles > 0 ? "+" : ""}
                          {t.miles.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{t.waktu}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => hapusTransaksi(t)}
                            disabled={!canDelete(t)}
                            title={
                              !canDelete(t)
                                ? "Riwayat Klaim Disetujui tidak dapat dihapus"
                                : "Hapus riwayat"
                            }
                            className={`transition-colors ${
                              canDelete(t)
                                ? "text-red-400 hover:text-red-600 cursor-pointer"
                                : "text-gray-200 cursor-not-allowed"
                            }`}
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
        {activeTab === "top" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="font-semibold text-gray-700 text-sm">
                Top Member berdasarkan Total Miles
              </p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Member</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Total Miles</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">
                    Jumlah Transaksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {topMemberData.map((m) => (
                  <tr key={m.rank} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 font-bold text-gray-600">{m.rank}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{m.nama}</p>
                      <p className="text-xs text-gray-400">{m.email}</p>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800">
                      {m.totalMiles.toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">{m.jumlahTransaksi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmHapus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-2">Hapus Riwayat?</h2>
            <p className="text-sm text-gray-500 mb-5">
              Penghapusan riwayat transaksi bersifat permanen dan tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmHapus(null)}
                className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={konfirmasiHapus}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
