"use client";

import { useState, useEffect } from "react";
import {
  getKlaimByMember,
  getDataFormKlaim,
  ajukanKlaim,
} from "@/app/actions/klaim";

// ===================== TYPES =====================
interface ClaimMissingMiles {
  id: number;
  maskapai: string;
  bandara_asal_nama: string;
  bandara_tujuan_nama: string;
  tanggal_penerbangan: string;
  flight_number: string;
  nomor_tiket: string;
  kelas_kabin: string;
  pnr: string;
  status_penerimaan: "Menunggu" | "Disetujui" | "Ditolak";
  timestamp: string;
}

interface Bandara {
  iata_code: string;
  nama: string;
  kota: string;
}

interface Maskapai {
  kode_maskapai: string;
  nama_maskapai: string;
}

type StatusFilter = "Semua" | "Menunggu" | "Disetujui" | "Ditolak";
type KelasKabin = "Economy" | "Business" | "First";

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

const KELAS_KABIN_OPTIONS: KelasKabin[] = ["Economy", "Business", "First"];

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
export default function KlaimMissingMilesMember() {
  const [emailMember, setEmailMember] = useState<string>("");
  const [claims, setClaims] = useState<ClaimMissingMiles[]>([]);
  const [bandaraOptions, setBandaraOptions] = useState<Bandara[]>([]);
  const [maskapaiOptions, setMaskapaiOptions] = useState<Maskapai[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Semua");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string>("");
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Ambil email dari localStorage dan load data
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const user = JSON.parse(raw);
    setEmailMember(user.email);

    Promise.all([
      getKlaimByMember(user.email),
      getDataFormKlaim(),
    ]).then(([klaimRes, formRes]) => {
      if (klaimRes.success) setClaims(klaimRes.data ?? []);
      if (formRes.success) {
        setBandaraOptions(formRes.bandara ?? []);
        setMaskapaiOptions(formRes.maskapai ?? []);
      }
      setLoading(false);
    });
  }, []);

  const filtered =
    statusFilter === "Semua"
      ? claims
      : claims.filter((c) => c.status_penerimaan === statusFilter);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setSuccessMsg("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const { maskapai, bandara_asal, bandara_tujuan, tanggal_penerbangan, flight_number, nomor_tiket, pnr } = form;
    if (!maskapai || !bandara_asal || !bandara_tujuan || !tanggal_penerbangan || !flight_number || !nomor_tiket || !pnr) {
      setFormError("Semua field wajib diisi.");
      return;
    }
    if (bandara_asal === bandara_tujuan) {
      setFormError("Bandara asal dan tujuan tidak boleh sama.");
      return;
    }

    setFormLoading(true);
    setFormError("");

    const result = await ajukanKlaim({ email_member: emailMember, ...form });

    setFormLoading(false);

    if (result.success) {
      // Refresh daftar klaim
      const fresh = await getKlaimByMember(emailMember);
      if (fresh.success) setClaims(fresh.data ?? []);
      setShowModal(false);
      setSuccessMsg("Klaim berhasil diajukan.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      // Pesan error dari trigger 4-1 langsung tampil di sini
      setFormError(result.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        Memuat data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Klaim Missing Miles</h1>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            + Ajukan Klaim
          </button>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
            {successMsg}
          </div>
        )}

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
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      Tidak ada klaim ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((claim) => (
                    <tr key={claim.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-blue-500 font-semibold">{formatClaimNo(claim.id)}</td>
                      <td className="px-4 py-3 text-gray-600">{claim.maskapai}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {claim.bandara_asal_nama} → {claim.bandara_tujuan_nama}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== MODAL AJUKAN KLAIM ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h2 className="text-gray-800 font-semibold text-base">Ajukan Klaim Baru</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 text-xs font-medium mb-1 block">Maskapai *</label>
                  <select
                    value={form.maskapai}
                    onChange={(e) => setForm({ ...form, maskapai: e.target.value })}
                    className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 shadow-sm"
                  >
                    <option value="">Pilih maskapai</option>
                    {maskapaiOptions.map((m) => (
                      <option key={m.kode_maskapai} value={m.kode_maskapai}>
                        {m.kode_maskapai} - {m.nama_maskapai}
                      </option>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 text-xs font-medium mb-1 block">Bandara Asal *</label>
                  <select
                    value={form.bandara_asal}
                    onChange={(e) => setForm({ ...form, bandara_asal: e.target.value })}
                    className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 shadow-sm"
                  >
                    <option value="">Pilih bandara</option>
                    {bandaraOptions.map((b) => (
                      <option key={b.iata_code} value={b.iata_code}>
                        {b.iata_code} - {b.nama}, {b.kota}
                      </option>
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
                    {bandaraOptions.map((b) => (
                      <option key={b.iata_code} value={b.iata_code}>
                        {b.iata_code} - {b.nama}, {b.kota}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                disabled={formLoading}
                className="px-5 py-2 text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {formLoading ? "Mengajukan..." : "Ajukan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}