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
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "Ditolak":
      return "bg-red-50 text-red-600 border border-red-200";
    default:
      return "bg-amber-50 text-amber-600 border border-amber-200";
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
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Kelola Klaim Missing Miles</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total klaim menunggu:{" "}
            <span className="text-amber-500 font-semibold">{totalMenunggu}</span>
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-500 text-xs font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 shadow-sm"
            >
              {["Semua", "Menunggu", "Disetujui", "Ditolak"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Maskapai */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-500 text-xs font-medium">Maskapai</label>
            <select
              value={maskapaiFilter}
              onChange={(e) => setMaskapaiFilter(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 shadow-sm"
            >
              <option value="Semua">Semua Maskapai</option>
              {MASKAPAI_OPTIONS.map((m) => (
                <option key={m.kode} value={m.kode}>{m.nama}</option>
              ))}
            </select>
          </div>

          {/* Tanggal Pengajuan From */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-500 text-xs font-medium">Tanggal Pengajuan (Dari)</label>
            <input
              type="date"
              value={tanggalFrom}
              onChange={(e) => setTanggalFrom(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 shadow-sm"
            />
          </div>

          {/* Tanggal Pengajuan To */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-500 text-xs font-medium">Tanggal Pengajuan (Sampai)</label>
            <input
              type="date"
              value={tanggalTo}
              onChange={(e) => setTanggalTo(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 shadow-sm"
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
                className="text-gray-400 hover:text-gray-600 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm transition-colors"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
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
                    <td colSpan={10} className="text-center py-12 text-gray-400">
                      Tidak ada klaim ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((claim) => (
                    <tr key={claim.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-blue-500 font-semibold">{formatClaimNo(claim.id)}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700 font-medium">{claim.nama_member}</p>
                        <p className="text-gray-400 text-xs">{claim.email_member}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{claim.maskapai}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {claim.bandara_asal} → {claim.bandara_tujuan}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{claim.tanggal_penerbangan}</td>
                      <td className="px-4 py-3 text-gray-600">{claim.flight_number}</td>
                      <td className="px-4 py-3 text-gray-600">{claim.kelas_kabin}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{claim.timestamp}</td>
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
                              className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs transition-colors border border-emerald-200"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => openModal(claim, "tolak")}
                              title="Tolak"
                              className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center text-xs transition-colors border border-red-200"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm shadow-xl px-6 py-6">
            <h2 className="text-gray-800 font-semibold text-base mb-1">Setujui Klaim</h2>
            <p className="text-gray-500 text-sm mb-4">
              Miles akan ditambahkan ke akun member sesuai rute dan kelas kabin.
            </p>
            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5 text-sm mb-5 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-400">Klaim</span>
                <span className="text-gray-700 font-mono font-medium">{formatClaimNo(selectedClaim.id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Member</span>
                <span className="text-gray-700">{selectedClaim.nama_member}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rute</span>
                <span className="text-gray-700">
                  {selectedClaim.bandara_asal} → {selectedClaim.bandara_tujuan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Kelas</span>
                <span className="text-gray-700 font-semibold">{selectedClaim.kelas_kabin}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm shadow-xl px-6 py-6">
            <h2 className="text-gray-800 font-semibold text-base mb-1">Tolak Klaim</h2>
            <p className="text-gray-500 text-sm mb-4">
              Klaim akan ditolak dan member akan diinformasikan.
            </p>
            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5 text-sm mb-5 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-400">Klaim</span>
                <span className="text-gray-700 font-mono font-medium">{formatClaimNo(selectedClaim.id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Member</span>
                <span className="text-gray-700">{selectedClaim.nama_member}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rute</span>
                <span className="text-gray-700">
                  {selectedClaim.bandara_asal} → {selectedClaim.bandara_tujuan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Kelas</span>
                <span className="text-gray-700 font-semibold">{selectedClaim.kelas_kabin}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors"
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