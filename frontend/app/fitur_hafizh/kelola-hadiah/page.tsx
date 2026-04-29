"use client";

import { useState } from "react";

type Penyedia = {
  id: number;
  nama: string;
};

type Hadiah = {
  kode_hadiah: string;
  nama: string;
  miles: number;
  deskripsi: string;
  valid_start_date: string;
  program_end: string;
  id_penyedia: number;
};

const dummyPenyedia: Penyedia[] = [
  { id: 1, nama: "Garuda Indonesia" },
  { id: 2, nama: "TravelokaPartner" },
  { id: 3, nama: "Plaza Premium" },
  { id: 4, nama: "Lion Air" },
  { id: 5, nama: "Citilink" },
  { id: 6, nama: "AirAsia" },
  { id: 7, nama: "Sriwijaya Air" },
  { id: 8, nama: "Batik Air" },
];

const initialHadiah: Hadiah[] = [
  { kode_hadiah: "RWD-001", nama: "Tiket Domestik PP", miles: 15000, deskripsi: "Tiket pulang-pergi rute domestik Indonesia", valid_start_date: "2024-01-01", program_end: "2025-12-31", id_penyedia: 1 },
  { kode_hadiah: "RWD-002", nama: "Upgrade ke Business Class", miles: 25000, deskripsi: "Upgrade dari economy class ke business class", valid_start_date: "2024-01-01", program_end: "2025-12-31", id_penyedia: 1 },
  { kode_hadiah: "RWD-003", nama: "Voucher Hotel Rp 500.000", miles: 8000, deskripsi: "Voucher menginap hotel bintang 3", valid_start_date: "2024-06-01", program_end: "2025-06-30", id_penyedia: 2 },
  { kode_hadiah: "RWD-004", nama: "Akses Lounge 1x", miles: 3000, deskripsi: "Akses lounge bandara seluruh Indonesia", valid_start_date: "2024-01-01", program_end: "2025-12-31", id_penyedia: 3 },
  { kode_hadiah: "RWD-005", nama: "Upgrade Business Class Intl", miles: 40000, deskripsi: "Upgrade ke business class rute internasional", valid_start_date: "2026-01-01", program_end: "2027-01-01", id_penyedia: 1 },
  { kode_hadiah: "RWD-006", nama: "Tiket Gratis Lion Air", miles: 12000, deskripsi: "Tiket gratis rute domestik Lion Air", valid_start_date: "2024-03-01", program_end: "2025-03-31", id_penyedia: 4 },
  { kode_hadiah: "RWD-007", nama: "Diskon 50% Citilink", miles: 5000, deskripsi: "Diskon 50% untuk pembelian tiket Citilink", valid_start_date: "2024-01-01", program_end: "2024-12-31", id_penyedia: 5 },
  { kode_hadiah: "RWD-008", nama: "Voucher Makan Rp 200.000", miles: 2000, deskripsi: "Voucher makan di restoran partner bandara", valid_start_date: "2024-01-01", program_end: "2025-06-30", id_penyedia: 2 },
  { kode_hadiah: "RWD-009", nama: "Extra Bagasi 10kg", miles: 4000, deskripsi: "Tambahan bagasi 10kg untuk satu penerbangan", valid_start_date: "2024-02-01", program_end: "2025-12-31", id_penyedia: 6 },
  { kode_hadiah: "RWD-010", nama: "Priority Check-in", miles: 1500, deskripsi: "Layanan priority check-in di semua bandara", valid_start_date: "2024-01-01", program_end: "2025-12-31", id_penyedia: 7 },
];

export default function KelolaHadiah() {
  const [hadiahList, setHadiahList] = useState<Hadiah[]>(initialHadiah);
  const [showTambah, setShowTambah] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showHapus, setShowHapus] = useState(false);
  const [selectedHadiah, setSelectedHadiah] = useState<Hadiah | null>(null);
  const [filterPenyedia, setFilterPenyedia] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [form, setForm] = useState({
    nama: "",
    miles: "",
    deskripsi: "",
    valid_start_date: "",
    program_end: "",
    id_penyedia: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const generateKode = () => {
    const lastKode = hadiahList[hadiahList.length - 1]?.kode_hadiah || "RWD-000";
    const lastNum = parseInt(lastKode.split("-")[1]);
    return `RWD-${String(lastNum + 1).padStart(3, "0")}`;
  };

  const getStatus = (program_end: string) => {
    return program_end >= today ? "aktif" : "tidak aktif";
  };

  const filteredHadiah = hadiahList.filter((h) => {
    const statusMatch = filterStatus === "semua" || getStatus(h.program_end) === filterStatus;
    const penyediaMatch = filterPenyedia === "semua" || h.id_penyedia === parseInt(filterPenyedia);
    return statusMatch && penyediaMatch;
  });

  const handleTambah = () => {
    if (!form.nama || !form.miles || !form.valid_start_date || !form.program_end || !form.id_penyedia) {
      alert("Harap isi semua field yang wajib!");
      return;
    }
    const newHadiah: Hadiah = {
      kode_hadiah: generateKode(),
      nama: form.nama,
      miles: parseInt(form.miles),
      deskripsi: form.deskripsi,
      valid_start_date: form.valid_start_date,
      program_end: form.program_end,
      id_penyedia: parseInt(form.id_penyedia),
    };
    setHadiahList([...hadiahList, newHadiah]);
    setShowTambah(false);
    setForm({ nama: "", miles: "", deskripsi: "", valid_start_date: "", program_end: "", id_penyedia: "" });
  };

  const handleEdit = () => {
    if (!selectedHadiah) return;
    setHadiahList(hadiahList.map((h) =>
      h.kode_hadiah === selectedHadiah.kode_hadiah
        ? { ...h, nama: form.nama, miles: parseInt(form.miles), deskripsi: form.deskripsi, valid_start_date: form.valid_start_date, program_end: form.program_end, id_penyedia: parseInt(form.id_penyedia) }
        : h
    ));
    setShowEdit(false);
  };

  const handleHapus = () => {
    if (!selectedHadiah) return;
    setHadiahList(hadiahList.filter((h) => h.kode_hadiah !== selectedHadiah.kode_hadiah));
    setShowHapus(false);
  };

  const openEdit = (h: Hadiah) => {
    setSelectedHadiah(h);
    setForm({ nama: h.nama, miles: String(h.miles), deskripsi: h.deskripsi, valid_start_date: h.valid_start_date, program_end: h.program_end, id_penyedia: String(h.id_penyedia) });
    setShowEdit(true);
  };

  const openHapus = (h: Hadiah) => {
    setSelectedHadiah(h);
    setShowHapus(true);
  };

  const inputClass = "w-full border border-gray-300 rounded px-3 py-2 mt-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300";
  const labelClass = "text-sm font-medium text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Hadiah & Penyedia</h1>
        <p className="text-sm text-gray-500">Masuk sebagai Mr. Admin Aero - Staf</p>
      </div>

      {/* Filter & Tombol Tambah */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3">
          <select
            className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white"
            value={filterPenyedia}
            onChange={(e) => setFilterPenyedia(e.target.value)}
          >
            <option value="semua">Semua Penyedia</option>
            {dummyPenyedia.map((p) => (
              <option key={p.id} value={p.id}>{p.nama}</option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="semua">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="tidak aktif">Tidak Aktif</option>
          </select>
        </div>
        <button
          onClick={() => { setShowTambah(true); setForm({ nama: "", miles: "", deskripsi: "", valid_start_date: "", program_end: "", id_penyedia: "" }); }}
          className="bg-[#1a2e4a] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#243d61]"
        >
          + Tambah Hadiah
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Kode</th>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Deskripsi</th>
              <th className="px-4 py-3 text-left">Penyedia</th>
              <th className="px-4 py-3 text-left">Miles</th>
              <th className="px-4 py-3 text-left">Periode</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredHadiah.map((h) => {
              const status = getStatus(h.program_end);
              const penyedia = dummyPenyedia.find((p) => p.id === h.id_penyedia);
              return (
                <tr key={h.kode_hadiah} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{h.kode_hadiah}</td>
                  <td className="px-4 py-3 text-gray-800">{h.nama}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{h.deskripsi}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{penyedia?.nama}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{h.miles.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-gray-600">{h.valid_start_date} — {h.program_end}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${status === "aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {status === "aktif" ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(h)} className="text-blue-500 hover:text-blue-700 text-lg">✏️</button>
                    <button
                      onClick={() => status !== "aktif" ? openHapus(h) : alert("Hadiah masih aktif, tidak dapat dihapus!")}
                      className={`text-lg ${status !== "aktif" ? "text-red-500 hover:text-red-700" : "text-gray-300 cursor-not-allowed"}`}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah */}
      {showTambah && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Tambah Hadiah Baru</h2>
              <button onClick={() => setShowTambah(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Nama Hadiah *</label>
                <input className={inputClass} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Masukkan nama hadiah" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Penyedia *</label>
                  <select className={inputClass} value={form.id_penyedia} onChange={(e) => setForm({ ...form, id_penyedia: e.target.value })}>
                    <option value="">Pilih penyedia</option>
                    {dummyPenyedia.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Miles Dibutuhkan *</label>
                  <input type="number" className={inputClass} value={form.miles} onChange={(e) => setForm({ ...form, miles: e.target.value })} placeholder="0" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Deskripsi</label>
                <textarea className={inputClass} rows={2} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} placeholder="Deskripsi hadiah (opsional)" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Valid Start *</label>
                  <input type="date" className={inputClass} value={form.valid_start_date} onChange={(e) => setForm({ ...form, valid_start_date: e.target.value })} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Program End *</label>
                  <input type="date" className={inputClass} value={form.program_end} onChange={(e) => setForm({ ...form, program_end: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={() => setShowTambah(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm mr-2 hover:bg-gray-50">Batal</button>
              <button onClick={handleTambah} className="bg-[#1a2e4a] text-white px-6 py-2 rounded text-sm font-medium hover:bg-[#243d61]">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEdit && selectedHadiah && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Edit Hadiah</h2>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Kode Hadiah</label>
                  <input className="w-full border border-gray-200 rounded px-3 py-2 mt-1 text-sm text-gray-400 bg-gray-100 cursor-not-allowed" value={selectedHadiah.kode_hadiah} disabled />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Nama Hadiah</label>
                  <input className={inputClass} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Penyedia</label>
                  <select className={inputClass} value={form.id_penyedia} onChange={(e) => setForm({ ...form, id_penyedia: e.target.value })}>
                    {dummyPenyedia.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Miles Dibutuhkan</label>
                  <input type="number" className={inputClass} value={form.miles} onChange={(e) => setForm({ ...form, miles: e.target.value })} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Deskripsi</label>
                <textarea className={inputClass} rows={2} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Valid Start</label>
                  <input type="date" className={inputClass} value={form.valid_start_date} onChange={(e) => setForm({ ...form, valid_start_date: e.target.value })} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Program End</label>
                  <input type="date" className={inputClass} value={form.program_end} onChange={(e) => setForm({ ...form, program_end: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={() => setShowEdit(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm mr-2 hover:bg-gray-50">Batal</button>
              <button onClick={handleEdit} className="bg-[#1a2e4a] text-white px-6 py-2 rounded text-sm font-medium hover:bg-[#243d61]">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {showHapus && selectedHadiah && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Hapus Hadiah?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Jika hadiah sudah pernah di-redeem oleh Member, riwayat redeem akan terpengaruh. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowHapus(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50">Batal</button>
              <button onClick={handleHapus} className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}