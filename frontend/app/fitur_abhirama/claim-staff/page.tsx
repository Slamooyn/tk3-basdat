"use client";

import { useState } from "react";

// ===================== TYPES =====================
interface ClaimMissingMiles {
  id: number;
  email_member: string;
  nama_member: string;
  email_staf: string | null;
  maskapai: string;
  bandara_asal: string;
  bandara_tujuan: string;
  tanggal_penerbangan: string;
  flight_number: string;
  nomor_tiket: string;
  kelas_kabin: string;
  pnr: string;
  status_penerimaan: "Menunggu" | "Disetujui" | "Ditolak";
  timestamp: string;
}

type StatusFilter = "Semua" | "Menunggu" | "Disetujui" | "Ditolak";
type ModalType = "setujui" | "tolak" | null;

// ===================== DUMMY DATA =====================
const LOGGED_IN_STAF_EMAIL = "admin@aeromiles.com";
const LOGGED_IN_STAF_NAME = "Mr. Admin Aero";

const MASKAPAI_MAP: Record<string, string> = {
  GA: "Garuda Indonesia",
  SQ: "Singapore Airlines",
  MH: "Malaysia Airlines",
  CX: "Cathay Pacific",
  EK: "Emirates",
  JT: "Lion Air",
  QG: "Citilink",
};

const MASKAPAI_OPTIONS = Object.entries(MASKAPAI_MAP).map(([k, v]) => ({
  kode: k,
  nama: `${k} - ${v}`,
}));

const INITIAL_CLAIMS: ClaimMissingMiles[] = [
  {
    id: 1,
    email_member: "john@example.com",
    nama_member: "John W. Doe",
    email_staf: "admin@aeromiles.com",
    maskapai: "GA",
    bandara_asal: "CGK",
    bandara_tujuan: "DPS",
    tanggal_penerbangan: "2024-10-01",
    flight_number: "GA404",
    nomor_tiket: "TKT-001",
    kelas_kabin: "Business",
    pnr: "ABC123",
    status_penerimaan: "Disetujui",
    timestamp: "2024-10-05 18:45:00",
  },
  {
    id: 2,
    email_member: "john@example.com",
    nama_member: "John W. Doe",
    email_staf: null,
    maskapai: "SQ",
    bandara_asal: "SIN",
    bandara_tujuan: "NRT",
    tanggal_penerbangan: "2024-11-15",
    flight_number: "SQ12",
    nomor_tiket: "TKT-002",
    kelas_kabin: "Economy",
    pnr: "DEF456",
    status_penerimaan: "Menunggu",
    timestamp: "2024-11-20 18:45:00",
  },
  {
    id: 3,
    email_member: "jane@example.com",
    nama_member: "Jane Smith",
    email_staf: "staff2@aeromiles.com",
    maskapai: "GA",
    bandara_asal: "CGK",
    bandara_tujuan: "SUB",
    tanggal_penerbangan: "2024-12-01",
    flight_number: "GA310",
    nomor_tiket: "TKT-003",
    kelas_kabin: "Economy",
    pnr: "GHI789",
    status_penerimaan: "Ditolak",
    timestamp: "2024-12-05 11:45:00",
  },
  {
    id: 4,
    email_member: "budi@example.com",
    nama_member: "Budi A. Santoso",
    email_staf: null,
    maskapai: "MH",
    bandara_asal: "KUL",
    bandara_tujuan: "BKK",
    tanggal_penerbangan: "2025-01-10",
    flight_number: "MH780",
    nomor_tiket: "TKT-004",
    kelas_kabin: "Premium Economy",
    pnr: "JKL012",
    status_penerimaan: "Menunggu",
    timestamp: "2025-01-15 18:45:00",
  },
  {
    id: 5,
    email_member: "sari@example.com",
    nama_member: "Sari Dewi",
    email_staf: null,
    maskapai: "EK",
    bandara_asal: "CGK",
    bandara_tujuan: "HKG",
    tanggal_penerbangan: "2025-02-20",
    flight_number: "EK358",
    nomor_tiket: "TKT-005",
    kelas_kabin: "Business",
    pnr: "MNO345",
    status_penerimaan: "Menunggu",
    timestamp: "2025-02-25 09:30:00",
  },
];

// ===================== HELPERS =====================
const formatClaimNo = (id: number) => `CLM-${String(id).padStart(3, "0")}`;

const getStatusStyle = (status: string) => {
  switch (status) {
    case "Disetujui":
      return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
    case "Ditolak":
      return "bg-red-500/20 text-red-300 border border-red-500/40";
    default:
      return "bg-amber-500/20 text-amber-300 border border-amber-500/40";
  }
};

// ===================== COMPONENT =====================
export default function KlaimMissingMilesStaf() {
  const [claims, setClaims] = useState<ClaimMissingMiles[]>(INITIAL_CLAIMS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Semua");
  const [maskapaiFilter, setMaskapaiFilter] = useState<string>("Semua");
  const [tanggalFrom, setTanggalFrom] = useState<string>("");
  const [tanggalTo, setTanggalTo] = useState<string>("");
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedClaim, setSelectedClaim] = useState<ClaimMissingMiles | null>(null);

  // ---- Filtering ----
  const filtered = claims.filter((c) => {
    const matchStatus = statusFilter === "Semua" || c.status_penerimaan === statusFilter;
    const matchMaskapai = maskapaiFilter === "Semua" || c.maskapai === maskapaiFilter;
    const matchFrom = !tanggalFrom || c.timestamp >= tanggalFrom;
    const matchTo = !tanggalTo || c.timestamp <= tanggalTo + " 23:59:59";
    return matchStatus && matchMaskapai && matchFrom && matchTo;
  });

  const totalMenunggu = claims.filter((c) => c.status_penerimaan === "Menunggu").length;

  // ---- Open modal ----
  const openModal = (claim: ClaimMissingMiles, type: ModalType) => {
    setSelectedClaim(claim);
    setModalType(type);
  };

  // ---- Confirm action ----
  const handleConfirm = () => {
    if (!selectedClaim || !modalType) return;
    const newStatus = modalType === "setujui" ? "Disetujui" : "Ditolak";
    setClaims((prev) =>
      prev.map((c) =>
        c.id === selectedClaim.id
          ? { ...c, status_penerimaan: newStatus, email_staf: LOGGED_IN_STAF_EMAIL }
          : c
      )
    );
    setModalType(null);
    setSelectedClaim(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans">
      {/* Navbar */}
      <nav className="bg-[#0d1530] border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[#4fa3e0] text-xl font-bold tracking-tight">✈ AeroMiles</span>
          <span className="text-white/30 text-sm hidden md:block">|</span>
          <span className="text-white/60 text-sm hidden md:block">
            Masuk sebagai {LOGGED_IN_STAF_NAME} · Staf
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/60">
          <span>Dashboard</span>
          <span>Kelola Member</span>
          <span className="text-[#4fa3e0] font-semibold border-b border-[#4fa3e0]">Kelola Klaim</span>
          <span>Kelola Hadiah</span>
          <span>Kelola Mitra</span>
          <span>Laporan Transaksi</span>
          <span>Logout</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Kelola Klaim Missing Miles</h1>
          <p className="text-white/50 text-sm mt-1">
            Total klaim menunggu:{" "}
            <span className="text-amber-400 font-semibold">{totalMenunggu}</span>
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-white/40 text-xs">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-[#0d1530] border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#4fa3e0]"
            >
              {["Semua", "Menunggu", "Disetujui", "Ditolak"].map((s) => (
                <option key={s} value={s} className="bg-[#0d1530]">{s}</option>
              ))}
            </select>
          </div>

          {/* Maskapai */}
          <div className="flex flex-col gap-1">
            <label className="text-white/40 text-xs">Maskapai</label>
            <select
              value={maskapaiFilter}
              onChange={(e) => setMaskapaiFilter(e.target.value)}
              className="bg-[#0d1530] border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#4fa3e0]"
            >
              <option value="Semua" className="bg-[#0d1530]">Semua Maskapai</option>
              {MASKAPAI_OPTIONS.map((m) => (
                <option key={m.kode} value={m.kode} className="bg-[#0d1530]">{m.nama}</option>
              ))}
            </select>
          </div>

          {/* Tanggal Pengajuan From */}
          <div className="flex flex-col gap-1">
            <label className="text-white/40 text-xs">Tanggal Pengajuan (Dari)</label>
            <input
              type="date"
              value={tanggalFrom}
              onChange={(e) => setTanggalFrom(e.target.value)}
              className="bg-[#0d1530] border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#4fa3e0]"
            />
          </div>

          {/* Tanggal Pengajuan To */}
          <div className="flex flex-col gap-1">
            <label className="text-white/40 text-xs">Tanggal Pengajuan (Sampai)</label>
            <input
              type="date"
              value={tanggalTo}
              onChange={(e) => setTanggalTo(e.target.value)}
              className="bg-[#0d1530] border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#4fa3e0]"
            />
          </div>

          {/* Reset */}
          {(statusFilter !== "Semua" || maskapaiFilter !== "Semua" || tanggalFrom || tanggalTo) && (
            <div className="flex flex-col gap-1 justify-end">
              <button
                onClick={() => {
                  setStatusFilter("Semua");
                  setMaskapaiFilter("Semua");
                  setTanggalFrom("");
                  setTanggalTo("");
                }}
                className="text-white/40 hover:text-white/70 text-xs border border-white/10 rounded-lg px-3 py-2 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-[#0d1530] rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="text-left px-4 py-3 font-medium">No. Klaim</th>
                  <th className="text-left px-4 py-3 font-medium">Member</th>
                  <th className="text-left px-4 py-3 font-medium">Maskapai</th>
                  <th className="text-left px-4 py-3 font-medium">Rute</th>
                  <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium">Flight</th>
                  <th className="text-left px-4 py-3 font-medium">Kelas</th>
                  <th className="text-left px-4 py-3 font-medium">Tanggal Pengajuan</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-white/30">
                      Tidak ada klaim ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((claim) => (
                    <tr key={claim.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-mono text-[#4fa3e0]">{formatClaimNo(claim.id)}</td>
                      <td className="px-4 py-3">
                        <p className="text-white/80 font-medium">{claim.nama_member}</p>
                        <p className="text-white/40 text-xs">{claim.email_member}</p>
                      </td>
                      <td className="px-4 py-3 text-white/80">{claim.maskapai}</td>
                      <td className="px-4 py-3 text-white/80">
                        {claim.bandara_asal} → {claim.bandara_tujuan}
                      </td>
                      <td className="px-4 py-3 text-white/70">{claim.tanggal_penerbangan}</td>
                      <td className="px-4 py-3 text-white/70">{claim.flight_number}</td>
                      <td className="px-4 py-3 text-white/70">{claim.kelas_kabin}</td>
                      <td className="px-4 py-3 text-white/50 text-xs">{claim.timestamp}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(claim.status_penerimaan)}`}>
                          {claim.status_penerimaan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {claim.status_penerimaan === "Menunggu" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal(claim, "setujui")}
                              title="Setujui"
                              className="w-7 h-7 rounded-full bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs transition-colors"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => openModal(claim, "tolak")}
                              title="Tolak"
                              className="w-7 h-7 rounded-full bg-red-500/15 hover:bg-red-500/30 text-red-400 flex items-center justify-center text-xs transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== MODAL SETUJUI ===== */}
      {modalType === "setujui" && selectedClaim && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1530] border border-white/15 rounded-2xl w-full max-w-sm shadow-2xl px-6 py-6">
            <h2 className="text-white font-semibold text-base mb-1">Setujui Klaim</h2>
            <p className="text-white/50 text-sm mb-4">
              Miles akan ditambahkan ke akun member sesuai rute dan kelas kabin.
            </p>
            <div className="bg-white/5 rounded-xl px-4 py-3 space-y-1.5 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-white/50">Klaim</span>
                <span className="text-white font-mono">{formatClaimNo(selectedClaim.id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Member</span>
                <span className="text-white">{selectedClaim.nama_member}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Rute</span>
                <span className="text-white">
                  {selectedClaim.bandara_asal} → {selectedClaim.bandara_tujuan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Kelas</span>
                <span className="text-white font-semibold">{selectedClaim.kelas_kabin}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-sm text-white/60 hover:text-white border border-white/15 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              >
                Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL TOLAK ===== */}
      {modalType === "tolak" && selectedClaim && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1530] border border-white/15 rounded-2xl w-full max-w-sm shadow-2xl px-6 py-6">
            <h2 className="text-white font-semibold text-base mb-1">Tolak Klaim</h2>
            <p className="text-white/50 text-sm mb-4">
              Klaim akan ditolak dan member akan diinformasikan.
            </p>
            <div className="bg-white/5 rounded-xl px-4 py-3 space-y-1.5 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-white/50">Klaim</span>
                <span className="text-white font-mono">{formatClaimNo(selectedClaim.id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Member</span>
                <span className="text-white">{selectedClaim.nama_member}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Rute</span>
                <span className="text-white">
                  {selectedClaim.bandara_asal} → {selectedClaim.bandara_tujuan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Kelas</span>
                <span className="text-white font-semibold">{selectedClaim.kelas_kabin}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-sm text-white/60 hover:text-white border border-white/15 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}