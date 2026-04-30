"use client";

import { useState } from "react";

// ===================== TYPES =====================
interface ClaimMissingMiles {
  id: number;
  email_member: string;
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
type KelasKabin = "Economy" | "Premium Economy" | "Business" | "First";

// ===================== DUMMY DATA =====================
const LOGGED_IN_MEMBER_EMAIL = "john@example.com";
const LOGGED_IN_MEMBER_AWARD_MILES = 32000;

const MASKAPAI_OPTIONS = [
  { kode: "GA", nama: "GA - Garuda Indonesia" },
  { kode: "SQ", nama: "SQ - Singapore Airlines" },
  { kode: "MH", nama: "MH - Malaysia Airlines" },
  { kode: "CX", nama: "CX - Cathay Pacific" },
  { kode: "EK", nama: "EK - Emirates" },
  { kode: "JT", nama: "JT - Lion Air" },
  { kode: "QG", nama: "QG - Citilink" },
];

const BANDARA_OPTIONS = [
  { iata: "CGK", label: "CGK - Soekarno-Hatta, Jakarta" },
  { iata: "DPS", label: "DPS - Ngurah Rai, Bali" },
  { iata: "SUB", label: "SUB - Juanda, Surabaya" },
  { iata: "SIN", label: "SIN - Changi, Singapura" },
  { iata: "KUL", label: "KUL - KLIA, Kuala Lumpur" },
  { iata: "NRT", label: "NRT - Narita, Tokyo" },
  { iata: "BKK", label: "BKK - Suvarnabhumi, Bangkok" },
  { iata: "HKG", label: "HKG - Hong Kong Int'l" },
];

const KELAS_KABIN_OPTIONS: KelasKabin[] = [
  "Economy",
  "Premium Economy",
  "Business",
  "First",
];

const INITIAL_CLAIMS: ClaimMissingMiles[] = [
  {
    id: 1,
    email_member: "john@example.com",
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
    email_member: "john@example.com",
    email_staf: "staff2@aeromiles.com",
    maskapai: "MH",
    bandara_asal: "KUL",
    bandara_tujuan: "BKK",
    tanggal_penerbangan: "2024-09-05",
    flight_number: "MH780",
    nomor_tiket: "TKT-003",
    kelas_kabin: "Premium Economy",
    pnr: "GHI789",
    status_penerimaan: "Ditolak",
    timestamp: "2024-09-10 09:15:00",
  },
];

// ===================== HELPERS =====================
const generateClaimId = (claims: ClaimMissingMiles[]) =>
  claims.length > 0 ? Math.max(...claims.map((c) => c.id)) + 1 : 1;

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

// ===================== FORM STATE =====================
interface FormState {
  maskapai: string;
  bandara_asal: string;
  bandara_tujuan: string;
  tanggal_penerbangan: string;
  flight_number: string;
  nomor_tiket: string;
  kelas_kabin: KelasKabin;
  pnr: string;
}

const EMPTY_FORM: FormState = {
  maskapai: "",
  bandara_asal: "",
  bandara_tujuan: "",
  tanggal_penerbangan: "",
  flight_number: "",
  nomor_tiket: "",
  kelas_kabin: "Economy",
  pnr: "",
};

// ===================== COMPONENT =====================
export default function KlaimMissingMilesMember() {
  const [claims, setClaims] = useState<ClaimMissingMiles[]>(INITIAL_CLAIMS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Semua");
  const [showModal, setShowModal] = useState(false);
  const [editingClaim, setEditingClaim] = useState<ClaimMissingMiles | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClaimMissingMiles | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string>("");

  // Filter claims milik member yang login
  const myClaims = claims.filter((c) => c.email_member === LOGGED_IN_MEMBER_EMAIL);
  const filtered =
    statusFilter === "Semua"
      ? myClaims
      : myClaims.filter((c) => c.status_penerimaan === statusFilter);

  // ---- Open modal ajukan/edit ----
  const openCreate = () => {
    setEditingClaim(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (claim: ClaimMissingMiles) => {
    if (claim.status_penerimaan !== "Menunggu") return;
    setEditingClaim(claim);
    setForm({
      maskapai: claim.maskapai,
      bandara_asal: claim.bandara_asal,
      bandara_tujuan: claim.bandara_tujuan,
      tanggal_penerbangan: claim.tanggal_penerbangan,
      flight_number: claim.flight_number,
      nomor_tiket: claim.nomor_tiket,
      kelas_kabin: claim.kelas_kabin as KelasKabin,
      pnr: claim.pnr,
    });
    setFormError("");
    setShowModal(true);
  };

  // ---- Validasi duplikat ----
  const isDuplicate = (f: FormState, excludeId?: number) =>
    myClaims.some(
      (c) =>
        c.id !== excludeId &&
        c.flight_number === f.flight_number &&
        c.tanggal_penerbangan === f.tanggal_penerbangan &&
        c.nomor_tiket === f.nomor_tiket
    );

  // ---- Submit ----
  const handleSubmit = () => {
    const { maskapai, bandara_asal, bandara_tujuan, tanggal_penerbangan, flight_number, nomor_tiket, pnr } = form;
    if (!maskapai || !bandara_asal || !bandara_tujuan || !tanggal_penerbangan || !flight_number || !nomor_tiket || !pnr) {
      setFormError("Semua field wajib diisi.");
      return;
    }
    if (bandara_asal === bandara_tujuan) {
      setFormError("Bandara asal dan tujuan tidak boleh sama.");
      return;
    }
    if (isDuplicate(form, editingClaim?.id)) {
      setFormError("Klaim duplikat: flight number, tanggal, dan nomor tiket sudah pernah diajukan.");
      return;
    }

    if (editingClaim) {
      setClaims((prev) =>
        prev.map((c) =>
          c.id === editingClaim.id ? { ...c, ...form } : c
        )
      );
    } else {
      const newId = generateClaimId(claims);
      setClaims((prev) => [
        ...prev,
        {
          id: newId,
          email_member: LOGGED_IN_MEMBER_EMAIL,
          email_staf: null,
          ...form,
          status_penerimaan: "Menunggu",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        },
      ]);
    }
    setShowModal(false);
  };

  // ---- Delete ----
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setClaims((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Klaim Missing Miles</h1>
            <p className="text-gray-500 text-sm mt-1">
              Award Miles tersedia:{" "}
              <span className="text-blue-500 font-semibold">{LOGGED_IN_MEMBER_AWARD_MILES.toLocaleString()}</span>
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            + Ajukan Klaim
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["Semua", "Menunggu", "Disetujui", "Ditolak"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                statusFilter === s
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-gray-200 text-gray-500 bg-white hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                  <th className="text-left px-4 py-3 font-medium">No. Klaim</th>
                  <th className="text-left px-4 py-3 font-medium">Maskapai</th>
                  <th className="text-left px-4 py-3 font-medium">Rute</th>
                  <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium">Flight</th>
                  <th className="text-left px-4 py-3 font-medium">Kelas</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Tanggal Pengajuan</th>
                  <th className="text-left px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400">
                      Tidak ada klaim ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((claim) => (
                    <tr key={claim.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-blue-500 font-semibold">{formatClaimNo(claim.id)}</td>
                      <td className="px-4 py-3 text-gray-600">{claim.maskapai}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {claim.bandara_asal} → {claim.bandara_tujuan}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{claim.tanggal_penerbangan}</td>
                      <td className="px-4 py-3 text-gray-600">{claim.flight_number}</td>
                      <td className="px-4 py-3 text-gray-600">{claim.kelas_kabin}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(claim.status_penerimaan)}`}>
                          {claim.status_penerimaan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{claim.timestamp}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {claim.status_penerimaan === "Menunggu" ? (
                            <>
                              <button
                                onClick={() => openEdit(claim)}
                                className="text-gray-400 hover:text-blue-500 transition-colors"
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => setDeleteTarget(claim)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Batalkan"
                              >
                                🗑️
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== MODAL AJUKAN / EDIT KLAIM ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h2 className="text-gray-800 font-semibold text-base">
                {editingClaim ? "Edit Klaim" : "Ajukan Klaim Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}

              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 text-xs font-medium mb-1 block">Maskapai *</label>
                  <select
                    value={form.maskapai}
                    onChange={(e) => setForm({ ...form, maskapai: e.target.value })}
                    className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 shadow-sm"
                  >
                    <option value="">Pilih maskapai</option>
                    {MASKAPAI_OPTIONS.map((m) => (
                      <option key={m.kode} value={m.kode}>{m.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-500 text-xs font-medium mb-1 block">Kelas Kabin *</label>
                  <select
                    value={form.kelas_kabin}
                    onChange={(e) => setForm({ ...form, kelas_kabin: e.target.value as KelasKabin })}
                    className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 shadow-sm"
                  >
                    {KELAS_KABIN_OPTIONS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 text-xs font-medium mb-1 block">Bandara Asal *</label>
                  <select
                    value={form.bandara_asal}
                    onChange={(e) => setForm({ ...form, bandara_asal: e.target.value })}
                    className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 shadow-sm"
                  >
                    <option value="">Pilih bandara</option>
                    {BANDARA_OPTIONS.map((b) => (
                      <option key={b.iata} value={b.iata}>{b.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-500 text-xs font-medium mb-1 block">Bandara Tujuan *</label>
                  <select
                    value={form.bandara_tujuan}
                    onChange={(e) => setForm({ ...form, bandara_tujuan: e.target.value })}
                    className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 shadow-sm"
                  >
                    <option value="">Pilih bandara</option>
                    {BANDARA_OPTIONS.map((b) => (
                      <option key={b.iata} value={b.iata}>{b.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 text-xs font-medium mb-1 block">Tanggal Penerbangan *</label>
                  <input
                    type="date"
                    value={form.tanggal_penerbangan}
                    onChange={(e) => setForm({ ...form, tanggal_penerbangan: e.target.value })}
                    className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs font-medium mb-1 block">Flight Number *</label>
                  <input
                    type="text"
                    placeholder="cth: GA404"
                    value={form.flight_number}
                    onChange={(e) => setForm({ ...form, flight_number: e.target.value })}
                    className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 placeholder:text-gray-300 focus:outline-none focus:border-blue-400 shadow-sm"
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 text-xs font-medium mb-1 block">Nomor Tiket *</label>
                  <input
                    type="text"
                    placeholder="cth: 0011223345"
                    value={form.nomor_tiket}
                    onChange={(e) => setForm({ ...form, nomor_tiket: e.target.value })}
                    className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 placeholder:text-gray-300 focus:outline-none focus:border-blue-400 shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs font-medium mb-1 block">PNR *</label>
                  <input
                    type="text"
                    placeholder="cth: P52DKC"
                    value={form.pnr}
                    onChange={(e) => setForm({ ...form, pnr: e.target.value })}
                    className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 placeholder:text-gray-300 focus:outline-none focus:border-blue-400 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                {editingClaim ? "Simpan" : "Ajukan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL KONFIRMASI BATALKAN ===== */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm shadow-xl px-6 py-6">
            <h2 className="text-gray-800 font-semibold text-base mb-2">Batalkan Klaim?</h2>
            <p className="text-gray-500 text-sm mb-5">
              Klaim <span className="text-gray-700 font-medium">{formatClaimNo(deleteTarget.id)}</span> akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
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