"use client";

import { useState, useEffect } from "react";
import { getDataRedeem, redeemHadiah } from "@/app/actions/redeem";

function getEmailFromStorage(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored).email : "";
}

interface Hadiah {
  kode_hadiah: string;
  nama: string;
  miles: number;
  deskripsi: string;
  valid_start_date: string;
  program_end: string;
  penyedia: string;
}

interface RiwayatRedeem {
  hadiah: string;
  waktu: string;
  miles: number;
}

export default function RedeemHadiah() {
  const [email] = useState<string>(getEmailFromStorage);
  const [awardMiles, setAwardMiles] = useState(0);
  const [katalog, setKatalog] = useState<Hadiah[]>([]);
  const [riwayat, setRiwayat] = useState<RiwayatRedeem[]>([]);
  const [activeTab, setActiveTab] = useState<"katalog" | "riwayat">("katalog");
  const [confirmHadiah, setConfirmHadiah] = useState<Hadiah | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!email) return;
    getDataRedeem(email).then((res) => {
      if (res.success) {
        setAwardMiles(res.award_miles ?? 0);
        setKatalog((res.hadiah ?? []) as Hadiah[]);
        setRiwayat((res.riwayat ?? []) as RiwayatRedeem[]);
      }
      setLoading(false);
    });
  }, [email]);

  const today = new Date().toISOString().split("T")[0];
  const katalogAktif = katalog.filter(
    (h) => h.program_end >= today && h.valid_start_date <= today
  );

  async function konfirmasiRedeem() {
    if (!confirmHadiah || submitting) return;
    setSubmitting(true);
    setErrorMsg("");

    const res = await redeemHadiah(email, confirmHadiah.kode_hadiah);

    if (!res.success) {
      // Pesan error dari trigger 3.1 (saldo tidak cukup / periode tidak aktif)
      setErrorMsg(res.message ?? "Gagal redeem.");
      setConfirmHadiah(null);
      setSubmitting(false);
      return;
    }

    setAwardMiles(res.award_miles ?? awardMiles - confirmHadiah.miles);
    setRiwayat((prev) => [
      {
        hadiah: confirmHadiah.nama,
        waktu: new Date().toISOString().replace("T", " ").slice(0, 16),
        miles: -confirmHadiah.miles,
      },
      ...prev,
    ]);
    setSuccessMsg(res.message ?? `Berhasil redeem "${confirmHadiah.nama}"!`);
    setConfirmHadiah(null);
    setSubmitting(false);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  if (loading) return <div className="p-8 text-gray-400">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Redeem Hadiah</h1>
        <p className="text-sm text-gray-500 mb-6">
          Award Miles tersedia:{" "}
          <span className="font-bold text-gray-800">{awardMiles.toLocaleString("id-ID")}</span>
        </p>

        {successMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
            ✓ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {(["katalog", "riwayat"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                activeTab === tab
                  ? "bg-white border border-b-white border-gray-200 text-gray-800 -mb-px"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "katalog" ? "Katalog Hadiah" : "Riwayat Redeem"}
            </button>
          ))}
        </div>

        {activeTab === "katalog" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {katalogAktif.length === 0 && (
              <p className="text-gray-400 text-sm col-span-2">
                Tidak ada hadiah aktif saat ini.
              </p>
            )}
            {katalogAktif.map((hadiah) => (
              <div
                key={hadiah.kode_hadiah}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                    {hadiah.kode_hadiah}
                  </span>
                  <span className="text-xs text-gray-500">{hadiah.penyedia}</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{hadiah.nama}</h3>
                <p className="text-xs text-gray-500 mb-3">{hadiah.deskripsi}</p>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {hadiah.miles.toLocaleString("id-ID")} miles
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Periode: {hadiah.valid_start_date} — {hadiah.program_end}
                </p>

                {/* Tombol selalu aktif — validasi saldo dilakukan oleh trigger 3.1 */}
                <button
                  onClick={() => {
                    setErrorMsg("");
                    setConfirmHadiah(hadiah);
                  }}
                  className="w-full py-2 rounded-lg text-sm font-bold transition-colors bg-red-600 hover:bg-red-700 text-white"
                >
                  REDEEM
                </button>

                {/* Info saldo tidak cukup hanya sebagai hint, bukan disable button */}
                {awardMiles < hadiah.miles && (
                  <p className="text-xs text-red-400 mt-1 text-center">
                    ⚠ Miles Anda mungkin tidak mencukupi
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "riwayat" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Hadiah</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Waktu</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Miles</th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      Belum ada riwayat redeem
                    </td>
                  </tr>
                ) : (
                  riwayat.map((r, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-800">{r.hadiah}</td>
                      <td className="px-5 py-3 text-gray-500">{r.waktu}</td>
                      <td className="px-5 py-3 text-right font-semibold text-red-500">
                        -{Math.abs(r.miles).toLocaleString("id-ID")}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Cetak"
                        >
                          🖨
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal konfirmasi redeem */}
      {confirmHadiah && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Redeem Miles</h2>
            <p className="text-sm text-gray-500 mb-4">
              Miles akan dipotong sebesar{" "}
              <span className="font-bold text-gray-800">
                {confirmHadiah.miles.toLocaleString("id-ID")}
              </span>{" "}
              untuk reward <span className="font-semibold">{confirmHadiah.nama}</span> dengan
              kode <span className="font-semibold">{confirmHadiah.kode_hadiah}</span> dari{" "}
              {confirmHadiah.penyedia}
            </p>

            {/* Info saldo di dalam modal */}
            <div className="bg-gray-50 rounded-lg px-4 py-3 mb-4 text-sm flex justify-between">
              <span className="text-gray-500">Award Miles kamu</span>
              <span className={`font-bold ${awardMiles < confirmHadiah.miles ? "text-red-500" : "text-gray-800"}`}>
                {awardMiles.toLocaleString("id-ID")} miles
              </span>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmHadiah(null)}
                className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={konfirmasiRedeem}
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                {submitting ? "Memproses..." : "Redeem"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
