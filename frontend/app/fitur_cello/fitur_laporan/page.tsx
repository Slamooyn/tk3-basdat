"use client";

import { useState, useEffect } from "react";
import { getDataLaporan } from "@/app/actions/laporan";

type TipeTransaksi = "Transfer" | "Redeem" | "Package" | "Klaim";

interface Transaksi {
  tipe: TipeTransaksi;
  email: string;
  nama_member: string;
  miles: number;
  waktu: string;
}

interface TopMember {
  rank: number;
  email: string;
  total_miles: number;
}

const TIPE_OPTIONS: (TipeTransaksi | "Semua")[] = ["Semua", "Transfer", "Redeem", "Package", "Klaim"];

const tipeIcon: Record<TipeTransaksi, string> = {
  Transfer: "⇄", Redeem: "🎁", Package: "🛒", Klaim: "✈",
};

export default function LaporanTransaksi() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [top5, setTop5] = useState<TopMember[]>([]);
  const [totalMilesBeredar, setTotalMilesBeredar] = useState(0);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"riwayat" | "top">("riwayat");
  const [filterTipe, setFilterTipe] = useState<TipeTransaksi | "Semua">("Semua");
  const [filterMember, setFilterMember] = useState("");
  const [filterTglDari, setFilterTglDari] = useState("");
  const [filterTglSampai, setFilterTglSampai] = useState("");
  const [confirmHapus, setConfirmHapus] = useState<Transaksi | null>(null);

  useEffect(() => {
    getDataLaporan().then((res) => {
      if (res.success) {
        setTransaksi((res.transaksi ?? []) as Transaksi[]);
        setTop5((res.top5 ?? []) as TopMember[]);
        setTotalMilesBeredar(Number(res.total_miles_beredar ?? 0));
      }
      setLoading(false);
    });
  }, []);

  const bulanIni = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  const totalRedeemBulanIni = transaksi
    .filter((t) => t.tipe === "Redeem" && t.waktu.startsWith(bulanIni))
    .reduce((acc, t) => acc + Math.abs(t.miles), 0);

  const totalKlaimDisetujui = transaksi
    .filter((t) => t.tipe === "Klaim" && t.miles > 0)
    .reduce((acc, t) => acc + t.miles, 0);

  const filtered = transaksi.filter((t) => {
    const matchTipe = filterTipe === "Semua" || t.tipe === filterTipe;
    const matchMember =
      !filterMember ||
      t.nama_member.toLowerCase().includes(filterMember.toLowerCase()) ||
      t.email.toLowerCase().includes(filterMember.toLowerCase());
    const matchDari = !filterTglDari || t.waktu >= filterTglDari;
    const matchSampai = !filterTglSampai || t.waktu <= filterTglSampai + " 99";
    return matchTipe && matchMember && matchDari && matchSampai;
  });

  // Hapus dari state lokal (catatan: ini tidak hapus dari DB, sesuaikan nanti)
  function hapusTransaksi(item: Transaksi) {
    setConfirmHapus(item);
  }

  function konfirmasiHapus() {
    if (!confirmHapus) return;
    // Hapus dari tampilan lokal
    setTransaksi((prev) =>
      prev.filter(
        (t) =>
          !(t.tipe === confirmHapus.tipe &&
            t.email === confirmHapus.email &&
            t.waktu === confirmHapus.waktu)
      )
    );
    setConfirmHapus(null);
  }

  if (loading) return <div className="p-8 text-gray-400">Memuat data laporan...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Laporan & Riwayat Transaksi</h1>

        {/* Summary cards */}
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

        {/* Tabs */}
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
            {/* Filter */}
            <div className="flex flex-wrap gap-3 mb-4">
              <select
                value={filterTipe}
                onChange={(e) => setFilterTipe(e.target.value as TipeTransaksi | "Semua")}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {TIPE_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o === "Semua" ? "Semua Tipe" : o}</option>
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
                    filtered.map((t, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-gray-700">
                            <span className="text-base">{tipeIcon[t.tipe]}</span>
                            {t.tipe}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{t.nama_member}</p>
                          <p className="text-xs text-gray-400">{t.email}</p>
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${t.miles > 0 ? "text-green-600" : "text-red-500"}`}>
                          {t.miles > 0 ? "+" : ""}{Number(t.miles).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{t.waktu}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => hapusTransaksi(t)}
                            title="Hapus riwayat"
                            className="text-red-400 hover:text-red-600 cursor-pointer transition-colors"
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

        {/* Tab Top Member — data dari stored procedure teman (trigger 5.2) */}
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
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Total Miles</th>
                </tr>
              </thead>
              <tbody>
                {top5.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  top5.map((m) => (
                    <tr key={m.rank} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3 font-bold text-gray-600">{m.rank}</td>
                      <td className="px-5 py-3 text-gray-800">{m.email}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-800">
                        {Number(m.total_miles).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
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
