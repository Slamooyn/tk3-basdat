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

  // Resolve email on blur
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

    // Validasi field kosong
    if (!emailPenerima || !jumlah) {
      setFormError("Email penerima dan jumlah miles wajib diisi.");
      return;
    }

    // Validasi tidak kirim ke diri sendiri
    if (emailPenerima.toLowerCase() === LOGGED_IN_EMAIL) {
      setFormError("Anda tidak dapat mentransfer miles ke diri sendiri.");
      return;
    }

    // Validasi penerima terdaftar sebagai member
    const namaTarget = ACTIVE_MEMBERS[emailPenerima.toLowerCase()];
    if (!namaTarget) {
      setFormError("Email penerima tidak ditemukan sebagai Member aktif dalam sistem.");
      return;
    }

    // Validasi jumlah
    const jumlahNum = parseInt(jumlah, 10);
    if (isNaN(jumlahNum) || jumlahNum <= 0) {
      setFormError("Jumlah miles harus berupa angka positif.");
      return;
    }

    // Validasi saldo mencukupi
    if (jumlahNum > awardMiles) {
      setFormError(`Award miles Anda tidak mencukupi. Saldo tersedia: ${formatMiles(awardMiles)} miles.`);
      return;
    }

    // Buat transfer baru
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

  // Compute per-row displayed jumlah with sign
  const getDisplayedJumlah = (t: Transfer) => {
    const type = getTransferType(t);
    return type === "Kirim" ? -t.jumlah : t.jumlah;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans">
      {/* Navbar */}
      <nav className="bg-[#0d1530] border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[#4fa3e0] text-xl font-bold tracking-tight">✈ AeroMiles</span>
          <span className="text-white/30 text-sm hidden md:block">|</span>
          <span className="text-white/60 text-sm hidden md:block">
            Masuk sebagai Mr. John Doe · Member
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/60">
          <span>Dashboard</span>
          <span>Klaim Miles</span>
          <span className="text-[#4fa3e0] font-semibold border-b border-[#4fa3e0]">Transfer Miles</span>
          <span>Redeem Hadiah</span>
          <span>Beli Package</span>
          <span>Logout</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Transfer Miles</h1>
            <p className="text-white/50 text-sm mt-1">
              Award Miles tersedia:{" "}
              <span className="text-[#4fa3e0] font-semibold text-base">{formatMiles(awardMiles)}</span>
            </p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-[#4fa3e0] hover:bg-[#3b8bc7] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Transfer Baru
          </button>
        </div>

        {/* Riwayat Transfer */}
        <div className="bg-[#0d1530] rounded-xl border border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="text-white/80 font-semibold text-sm">Riwayat Transfer</h2>
          </div>

          {transfers.length === 0 ? (
            <div className="py-16 text-center text-white/30 text-sm">
              Belum ada riwayat transfer.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {transfers.map((t) => {
                const type = getTransferType(t);
                const displayedJumlah = getDisplayedJumlah(t);
                const isKirim = type === "Kirim";

                const counterpartEmail = isKirim ? t.email_member_2 : t.email_member_1;
                const counterpartName = isKirim
                  ? t.nama_penerima
                  : ACTIVE_MEMBERS[t.email_member_1] ?? t.email_member_1;

                return (
                  <div key={t.id} className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    {/* Left: icon + info */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-base ${
                          isKirim
                            ? "bg-red-500/10 text-red-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {isKirim ? "↑" : "↓"}
                      </div>
                      <div>
                        <p className="text-white/80 text-sm font-medium">{counterpartName}</p>
                        <p className="text-white/40 text-xs">{counterpartEmail}</p>
                        {t.catatan && (
                          <p className="text-white/30 text-xs italic mt-0.5">"{t.catatan}"</p>
                        )}
                      </div>
                    </div>

                    {/* Right: amount + type + timestamp */}
                    <div className="text-right flex flex-col items-end gap-1">
                      <span
                        className={`text-base font-semibold ${
                          isKirim ? "text-red-400" : "text-emerald-400"
                        }`}
                      >
                        {isKirim ? "-" : "+"}
                        {formatMiles(t.jumlah)} miles
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            isKirim
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {type}
                        </span>
                        <span className="text-white/30 text-xs">{t.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info note */}
        <p className="text-white/25 text-xs mt-4 text-center">
          Transfer yang sudah dibuat tidak dapat diubah atau dihapus.
        </p>
      </div>

      {/* ===== MODAL TRANSFER BARU ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1530] border border-white/15 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
              <h2 className="text-white font-semibold text-base">Transfer Miles</h2>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white text-lg">
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}

              {/* Award Miles Info */}
              <div className="bg-[#4fa3e0]/10 border border-[#4fa3e0]/20 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-white/60 text-sm">Award Miles tersedia</span>
                <span className="text-[#4fa3e0] font-bold">{formatMiles(awardMiles)}</span>
              </div>

              {/* Email Penerima */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Email Penerima *</label>
                <input
                  type="email"
                  placeholder="member@example.com"
                  value={emailPenerima}
                  onChange={(e) => {
                    setEmailPenerima(e.target.value);
                    setResolvedName(null);
                  }}
                  onBlur={handleEmailBlur}
                  className="w-full bg-white/5 border border-white/15 text-white text-sm rounded-lg px-3 py-2 placeholder:text-white/25 focus:outline-none focus:border-[#4fa3e0]"
                />
                {/* Resolved name feedback */}
                {resolvedName && (
                  <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                    <span>✓</span> {resolvedName}
                  </p>
                )}
                {emailPenerima && !resolvedName && (
                  <p className="text-white/30 text-xs mt-1">Pindahkan fokus untuk memverifikasi email.</p>
                )}
              </div>

              {/* Jumlah Miles */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Jumlah Miles *</label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={awardMiles}
                    placeholder="cth: 5000"
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 text-white text-sm rounded-lg px-3 py-2 placeholder:text-white/25 focus:outline-none focus:border-[#4fa3e0] pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">
                    miles
                  </span>
                </div>
                {jumlah && parseInt(jumlah) > awardMiles && (
                  <p className="text-red-400 text-xs mt-1">Melebihi award miles yang tersedia.</p>
                )}
              </div>

              {/* Catatan */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Catatan (opsional)</label>
                <textarea
                  rows={2}
                  placeholder="cth: Hadiah ulang tahun"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 text-white text-sm rounded-lg px-3 py-2 placeholder:text-white/25 focus:outline-none focus:border-[#4fa3e0] resize-none"
                />
              </div>

              {/* Warning permanen */}
              <p className="text-amber-400/70 text-xs">
                ⚠ Transfer bersifat permanen dan tidak dapat dibatalkan setelah dikonfirmasi.
              </p>
            </div>

            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-white/60 hover:text-white border border-white/15 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 text-sm font-semibold bg-[#4fa3e0] hover:bg-[#3b8bc7] text-white rounded-lg transition-colors"
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