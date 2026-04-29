"use client";

import { useState } from "react";

type Mitra = {
  email_mitra: string;
  id_penyedia: number;
  nama_mitra: string;
  tanggal_kerja_sama: string;
};

const initialMitra: Mitra[] = [
  { email_mitra: "partner@traveloka.com", id_penyedia: 1, nama_mitra: "TravelokaPartner", tanggal_kerja_sama: "2023-01-15" },
  { email_mitra: "partner@plazapremium.com", id_penyedia: 2, nama_mitra: "Plaza Premium", tanggal_kerja_sama: "2023-06-01" },
  { email_mitra: "partner@lionair.co.id", id_penyedia: 3, nama_mitra: "Lion Air Partner", tanggal_kerja_sama: "2023-08-20" },
  { email_mitra: "partner@citilink.co.id", id_penyedia: 4, nama_mitra: "Citilink Partner", tanggal_kerja_sama: "2024-01-10" },
  { email_mitra: "partner@airasia.com", id_penyedia: 5, nama_mitra: "AirAsia Partner", tanggal_kerja_sama: "2024-03-05" },
];

export default function KelolaMitra() {
  const [mitraList, setMitraList] = useState<Mitra[]>(initialMitra);
  const [showTambah, setShowTambah] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showHapus, setShowHapus] = useState(false);
  const [selectedMitra, setSelectedMitra] = useState<Mitra | null>(null);

  const [form, setForm] = useState({
    email_mitra: "",
    nama_mitra: "",
    tanggal_kerja_sama: "",
  });

  const generateIdPenyedia = () => {
    const lastId = mitraList[mitraList.length - 1]?.id_penyedia || 0;
    return lastId + 1;
  };

  const handleTambah = () => {
    if (!form.email_mitra || !form.nama_mitra || !form.tanggal_kerja_sama) {
      alert("Harap isi semua field yang wajib!");
      return;
    }
    if (mitraList.find((m) => m.email_mitra === form.email_mitra)) {
      alert("Email mitra sudah terdaftar!");
      return;
    }
    const newMitra: Mitra = {
      email_mitra: form.email_mitra,
      id_penyedia: generateIdPenyedia(),
      nama_mitra: form.nama_mitra,
      tanggal_kerja_sama: form.tanggal_kerja_sama,
    };
    setMitraList([...mitraList, newMitra]);
    setShowTambah(false);
    setForm({ email_mitra: "", nama_mitra: "", tanggal_kerja_sama: "" });
  };

  const handleEdit = () => {
    if (!selectedMitra) return;
    if (!form.nama_mitra || !form.tanggal_kerja_sama) {
      alert("Harap isi semua field!");
      return;
    }
    setMitraList(mitraList.map((m) =>
      m.email_mitra === selectedMitra.email_mitra
        ? { ...m, nama_mitra: form.nama_mitra, tanggal_kerja_sama: form.tanggal_kerja_sama }
        : m
    ));
    setShowEdit(false);
  };

  const handleHapus = () => {
    if (!selectedMitra) return;
    setMitraList(mitraList.filter((m) => m.email_mitra !== selectedMitra.email_mitra));
    setShowHapus(false);
  };

  const openEdit = (m: Mitra) => {
    setSelectedMitra(m);
    setForm({ email_mitra: m.email_mitra, nama_mitra: m.nama_mitra, tanggal_kerja_sama: m.tanggal_kerja_sama });
    setShowEdit(true);
  };

  const openHapus = (m: Mitra) => {
    setSelectedMitra(m);
    setShowHapus(true);
  };

  const inputClass = "w-full border border-gray-300 rounded px-3 py-2 mt-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300";
  const labelClass = "text-sm font-medium text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Mitra</h1>
        <p className="text-sm text-gray-500">Masuk sebagai Mr. Admin Aero - Staf</p>
      </div>

      {/* Tombol Tambah */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setShowTambah(true); setForm({ email_mitra: "", nama_mitra: "", tanggal_kerja_sama: "" }); }}
          className="bg-[#1a2e4a] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#243d61]"
        >
          + Tambah Mitra
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Email Mitra</th>
              <th className="px-4 py-3 text-left">ID Penyedia</th>
              <th className="px-4 py-3 text-left">Nama Mitra</th>
              <th className="px-4 py-3 text-left">Tanggal Kerja Sama</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {mitraList.map((m) => (
              <tr key={m.email_mitra} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800">{m.email_mitra}</td>
                <td className="px-4 py-3 text-gray-800">{m.id_penyedia}</td>
                <td className="px-4 py-3 text-gray-800">{m.nama_mitra}</td>
                <td className="px-4 py-3 text-gray-600">{m.tanggal_kerja_sama}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(m)} className="text-blue-500 hover:text-blue-700 text-lg">✏️</button>
                  <button onClick={() => openHapus(m)} className="text-red-500 hover:text-red-700 text-lg">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah */}
      {showTambah && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[450px] shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Tambah Mitra Baru</h2>
              <button onClick={() => setShowTambah(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Email Mitra *</label>
                <input type="email" className={inputClass} value={form.email_mitra} onChange={(e) => setForm({ ...form, email_mitra: e.target.value })} placeholder="partner@example.com" />
              </div>
              <div>
                <label className={labelClass}>Nama Mitra *</label>
                <input className={inputClass} value={form.nama_mitra} onChange={(e) => setForm({ ...form, nama_mitra: e.target.value })} placeholder="Nama mitra" />
              </div>
              <div>
                <label className={labelClass}>Tanggal Kerja Sama *</label>
                <input type="date" className={inputClass} value={form.tanggal_kerja_sama} onChange={(e) => setForm({ ...form, tanggal_kerja_sama: e.target.value })} />
              </div>
              <p className="text-xs text-gray-400">* ID Penyedia akan di-generate otomatis oleh sistem</p>
            </div>
            <div className="flex justify-end mt-5 gap-2">
              <button onClick={() => setShowTambah(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50">Batal</button>
              <button onClick={handleTambah} className="bg-[#1a2e4a] text-white px-6 py-2 rounded text-sm font-medium hover:bg-[#243d61]">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEdit && selectedMitra && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[450px] shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Edit Mitra</h2>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Email Mitra</label>
                <input className="w-full border border-gray-200 rounded px-3 py-2 mt-1 text-sm text-gray-400 bg-gray-100 cursor-not-allowed" value={selectedMitra.email_mitra} disabled />
              </div>
              <div>
                <label className={labelClass}>ID Penyedia</label>
                <input className="w-full border border-gray-200 rounded px-3 py-2 mt-1 text-sm text-gray-400 bg-gray-100 cursor-not-allowed" value={selectedMitra.id_penyedia} disabled />
              </div>
              <div>
                <label className={labelClass}>Nama Mitra *</label>
                <input className={inputClass} value={form.nama_mitra} onChange={(e) => setForm({ ...form, nama_mitra: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Tanggal Kerja Sama *</label>
                <input type="date" className={inputClass} value={form.tanggal_kerja_sama} onChange={(e) => setForm({ ...form, tanggal_kerja_sama: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end mt-5 gap-2">
              <button onClick={() => setShowEdit(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50">Batal</button>
              <button onClick={handleEdit} className="bg-[#1a2e4a] text-white px-6 py-2 rounded text-sm font-medium hover:bg-[#243d61]">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {showHapus && selectedMitra && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Hapus Mitra?</h2>
            <p className="text-sm text-gray-600 mb-1">Penghapusan mitra akan berpengaruh pada hadiah yang disediakan oleh mitra ini.</p>
            <p className="text-sm font-medium text-gray-700 mb-4">{selectedMitra.nama_mitra} ({selectedMitra.email_mitra})</p>
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