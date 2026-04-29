"use client";

import { useState } from "react";

const dummyMember = {
  email: "john@example.com",
  nama: "Mr. John William Doe",
  awardMiles: 32000,
};

interface Hadiah {
  kode_hadiah: string;
  nama: string;
  miles: number;
  deskripsi: string;
  valid_start_date: string;
  program_end: string;
  penyedia: string;
}

const dummyHadiah: Hadiah[] = [
  {
    kode_hadiah: "RWD-001",
    nama: "Tiket Domestik PP",
    miles: 15000,
    deskripsi: "Tiket pulang-pergi rute domestik Indonesia",
    valid_start_date: "2024-01-01",
    program_end: "2027-12-31",
    penyedia: "Garuda Indonesia",
  },
  {
    kode_hadiah: "RWD-002",
    nama: "Upgrade ke Business Class",
    miles: 25000,
    deskripsi: "Melakukan upgrade dari economy class ke business class",
    valid_start_date: "2024-01-01",
    program_end: "2027-12-31",
    penyedia: "Garuda Indonesia",
  },
  {
    kode_hadiah: "RWD-003",
    nama: "Voucher Hotel Rp 500.000",
    miles: 8000,
    deskripsi: "Voucher hotel Jabodetabek berlaku 1 malam",
    valid_start_date: "2024-06-01",
    program_end: "2027-06-30",
    penyedia: "TravelokaPartner",
  },
  {
    kode_hadiah: "RWD-004",
    nama: "Akses Lounge 1x",
    miles: 3000,
    deskripsi: "Akses lounge seluruh bandara partner sekali masuk",
    valid_start_date: "2024-01-01",
    program_end: "2027-12-31",
    penyedia: "Plaza Premium",
  },
  {
    kode_hadiah: "RWD-005",
    nama: "Upgrade Business Class",
    miles: 15000,
    deskripsi: "Melakukan upgrade dari economy class ke business class",
    valid_start_date: "2026-01-01",
    program_end: "2027-01-01",
    penyedia: "Garuda Indonesia",
  },
];

interface RiwayatRedeem {
  hadiah: string;
  waktu: string;
  miles: number;
}

const dummyRiwayat: RiwayatRedeem[] = [
  { hadiah: "Akses Lounge 1x", waktu: "2025-01-20 16:00", miles: -3000 },
  { hadiah: "Voucher Hotel Rp 500.000", waktu: "2024-11-05 10:30", miles: -8000 },
];

export default function RedeemHadiah() {
  const [activeTab, setActiveTab] = useState<"katalog" | "riwayat">("katalog");
  const [confirmHadiah, setConfirmHadiah] = useState<Hadiah | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [riwayat, setRiwayat] = useState<RiwayatRedeem[]>(dummyRiwayat);
  const [awardMiles, setAwardMiles] = useState(dummyMember.awardMiles);

  const today = new Date().toISOString().split("T")[0];
  const katalogAktif = dummyHadiah.filter((h) => h.program_end >= today);

  function handleRedeem(hadiah: Hadiah) {
    setConfirmHadiah(hadiah);
  }

  function konfirmasiRedeem() {
    if (!confirmHadiah) return;
    if (awardMiles < confirmHadiah.miles) {
      alert("Award miles tidak mencukupi!");
      setConfirmHadiah(null);
      return;
    }
    const newEntry: RiwayatRedeem = {
      hadiah: confirmHadiah.nama,
      waktu: new Date().toISOString().replace("T", " ").slice(0, 16),
      miles: -confirmHadiah.miles,
    };
    setRiwayat([newEntry, ...riwayat]);
    setAwardMiles((prev) => prev - confirmHadiah.miles);
    setSuccessMsg(`Berhasil redeem "${confirmHadiah.nama}"!`);
    setConfirmHadiah(null);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#0f1b35] text-white px-6 py-3 flex items-center gap-6 text-sm flex-wrap">
        <span className="font-bold text-base tracking-wide mr-2">✈ AeroMiles</span>
        <span className="text-gray-400 text-xs border-r border-gray-600 pr-4">
          Dashboard
        </span>
        {["Identitas Saya", "Klaim Miles", "Transfer Miles"].map((item) => (
          <a key={item} href="#" className="text-gray-300 hover:text-white transition-colors">
            {item}
          </a>
        ))}
        <a href="#" className="text-white font-semibold border-b border-white pb-0.5">
          Redeem Hadiah
        </a>
        {["Beli Package", "Info Tier", "Pengaturan Profil"].map((item) => (
          <a key={item} href="#" className="text-gray-300 hover:text-white transition-colors">
            {item}
          </a>
        ))}
        <a href="#" className="ml-auto text-red-400 hover:text-red-300 transition-colors">
          ⎋ Logout
        </a>
      </nav>
      <div className="bg-[#0f1b35] text-gray-400 text-xs px-6 pb-2">
        Masuk sebagai{" "}
        <span className="text-blue-400 font-medium">{dummyMember.nama}</span> · Member
      </div>
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
                <button
                  onClick={() => handleRedeem(hadiah)}
                  disabled={awardMiles < hadiah.miles}
                  className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${
                    awardMiles >= hadiah.miles
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  REDEEM
                </button>
                {awardMiles < hadiah.miles && (
                  <p className="text-xs text-red-400 mt-1 text-center">Miles tidak mencukupi</p>
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
                        {r.miles.toLocaleString("id-ID")}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors" title="Cetak">
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
      {confirmHadiah && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Redeem Miles</h2>
            <p className="text-sm text-gray-500 mb-4">
              Miles akan dipotong sebesar{" "}
              <span className="font-bold text-gray-800">
                {confirmHadiah.miles.toLocaleString("id-ID")}
              </span>{" "}
              untuk reward{" "}
              <span className="font-semibold">{confirmHadiah.nama}</span> dengan kode{" "}
              <span className="font-semibold">{confirmHadiah.kode_hadiah}</span> dari{" "}
              {confirmHadiah.penyedia}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmHadiah(null)}
                className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={konfirmasiRedeem}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
              >
                Redeem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
