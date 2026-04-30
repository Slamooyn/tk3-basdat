"use client";

import { useState } from "react";

// ===================== TYPES =====================
interface Transfer {
  id: number;
  email_member_1: string; // pengirim
  email_member_2: string; // penerima
  nama_penerima: string;
  timestamp: string;
  jumlah: number;
  catatan: string;
}

// ===================== DUMMY DATA =====================
const LOGGED_IN_EMAIL = "john@example.com";
const LOGGED_IN_NAME = "Mr. John William Doe";
const LOGGED_IN_AWARD_MILES = 32000;

// Daftar member aktif untuk validasi
const ACTIVE_MEMBERS: Record<string, string> = {
  "jane@example.com": "Mrs. Jane Smith",
  "budi@example.com": "Mr. Budi Anto Santoso",
  "sari@example.com": "Ms. Sari Dewi",
  "lennon@example.com": "Mr. John Lennon",
  "diana@example.com": "Mrs. Diana Kusuma",
};

const INITIAL_TRANSFERS: Transfer[] = [
  {
    id: 1,
    email_member_1: "john@example.com",
    email_member_2: "jane@example.com",
    nama_penerima: "Mrs. Jane Smith",
    timestamp: "2025-01-15 10:30:00",
    jumlah: 5000,
    catatan: "Hadiah ulang tahun",
  },
  {
    id: 2,
    email_member_1: "budi@example.com",
    email_member_2: "john@example.com",
    nama_penerima: "Mr. John William Doe",
    timestamp: "2025-02-01 14:00:00",
    jumlah: 2000,
    catatan: "",
  },
  {
    id: 3,
    email_member_1: "john@example.com",
    email_member_2: "sari@example.com",
    nama_penerima: "Ms. Sari Dewi",
    timestamp: "2025-03-10 09:15:00",
    jumlah: 1500,
    catatan: "Transfer untuk liburan bareng",
  },
];

// ===================== HELPERS =====================
const formatMiles = (n: number) => n.toLocaleString("id-ID");

const getTransferType = (t: Transfer): "Kirim" | "Terima" =>
  t.email_member_1 === LOGGED_IN_EMAIL ? "Kirim" : "Terima";

// ===================== COMPONENT =====================
export default function TransferMilesMember() {
  const [transfers, setTransfers] = useState<Transfer[]>(INITIAL_TRANSFERS);
  const [awardMiles, setAwardMiles] = useState<number>(LOGGED_IN_AWARD_MILES);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [emailPenerima, setEmailPenerima] = useState("");
  const [jumlah, setJumlah] = useState<string>("");
  const [catatan, setCatatan] = useState("");
  const [formError, setFormError] = useState("");

  // Validation state
  const [resolvedName, setResolvedName] = useState<string | null>(null);

  const openModal = () => {
    setEmailPenerima("");
    setJumlah("");
    setCatatan("");
    setFormError("");
    setResolvedName(null);
    setShowModal(true);
  };

  const handleEmailBlur = () => {
    if (!emailPenerima) {
      setResolvedName(null);
      return;
    }
    const name = ACTIVE_MEMBERS[emailPenerima.toLowerCase()];
    setResolvedName(name ?? null);
  };

  const handleSubmit = () => {
    setFormError("");

    if (!emailPenerima || !jumlah) {
      setFormError("Email penerima dan jumlah miles wajib diisi.");
      return;
    }

    if (emailPenerima.toLowerCase() === LOGGED_IN_EMAIL) {
      setFormError("Anda tidak dapat mentransfer miles ke diri sendiri.");
      return;
    }

    const namaTarget = ACTIVE_MEMBERS[emailPenerima.toLowerCase()];
    if (!namaTarget) {
      setFormError("Email penerima tidak ditemukan sebagai Member aktif dalam sistem.");
      return;
    }

    const jumlahNum = parseInt(jumlah, 10);
    if (isNaN(jumlahNum) || jumlahNum <= 0) {
      setFormError("Jumlah miles harus berupa angka positif.");
      return;
    }

    if (jumlahNum > awardMiles) {
      setFormError(`Award miles Anda tidak mencukupi. Saldo tersedia: ${formatMiles(awardMiles)} miles.`);
      return;
    }

    const newTransfer: Transfer = {
      id: transfers.length > 0 ? Math.max(...transfers.map((t) => t.id)) + 1 : 1,
      email_member_1: LOGGED_IN_EMAIL,
      email_member_2: emailPenerima.toLowerCase(),
      nama_penerima: namaTarget,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      jumlah: jumlahNum,
      catatan,
    };

    setTransfers((prev) => [newTransfer, ...prev]);
    setAwardMiles((prev) => prev - jumlahNum);
    setShowModal(false);
  };

  const getDisplayedJumlah = (t: Transfer) => {
    const type = getTransferType(t);
    return type === "Kirim" ? -t.jumlah : t.jumlah;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Transfer Miles</h1>
            <p className="text-gray-500 text-sm mt-1">
              Award Miles tersedia:{" "}
              <span className="text-blue-600 font-semibold text-base">
                {formatMiles(awardMiles)}
              </span>
            </p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Transfer Baru
          </button>
        </div>

        {/* Riwayat Transfer */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-gray-700 font-semibold text-sm">Riwayat Transfer</h2>
          </div>

          {transfers.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Belum ada riwayat transfer.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transfers.map((t) => {
                const type = getTransferType(t);
                const isKirim = type === "Kirim";

                const counterpartEmail = isKirim ? t.email_member_2 : t.email_member_1;
                const counterpartName = isKirim
                  ? t.nama_penerima
                  : ACTIVE_MEMBERS[t.email_member_1] ?? t.email_member_1;

                return (
                  <div key={t.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-base ${
                          isKirim
                            ? "bg-red-100 text-red-500"
                            : "bg-emerald-100 text-emerald-500"
                        }`}
                      >
                        {isKirim ? "↑" : "↓"}
                      </div>
                      <div>
                        <p className="text-gray-800 text-sm font-medium">{counterpartName}</p>
                        <p className="text-gray-500 text-xs">{counterpartEmail}</p>
                        {t.catatan && (
                          <p className="text-gray-400 text-xs italic mt-0.5">"{t.catatan}"</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span
                        className={`text-base font-semibold ${
                          isKirim ? "text-red-500" : "text-emerald-500"
                        }`}
                      >
                        {isKirim ? "-" : "+"}
                        {formatMiles(t.jumlah)} miles
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            isKirim
                              ? "bg-red-100 text-red-500 border border-red-200"
                              : "bg-emerald-100 text-emerald-500 border border-emerald-200"
                          }`}
                        >
                          {type}
                        </span>
                        <span className="text-gray-400 text-xs">{t.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-gray-400 text-xs mt-4 text-center">
          Transfer yang sudah dibuat tidak dapat diubah atau dihapus.
        </p>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200">
              <h2 className="text-gray-900 font-semibold text-base">Transfer Miles</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 text-lg">
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-gray-600 text-sm">Award Miles tersedia</span>
                <span className="text-blue-600 font-bold">{formatMiles(awardMiles)}</span>
              </div>

              <input
                type="email"
                placeholder="member@example.com"
                value={emailPenerima}
                onChange={(e) => {
                  setEmailPenerima(e.target.value);
                  setResolvedName(null);
                }}
                onBlur={handleEmailBlur}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
              />

              <input
                type="number"
                min={1}
                max={awardMiles}
                placeholder="cth: 5000"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
              />

              <textarea
                rows={2}
                placeholder="cth: Hadiah ulang tahun"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              />

              <p className="text-amber-600 text-xs">
                ⚠ Transfer bersifat permanen dan tidak dapat dibatalkan.
              </p>
            </div>

            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}