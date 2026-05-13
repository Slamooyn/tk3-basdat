"use client";

import { useState, useEffect } from "react";
import { getMitra, tambahMitra, updateMitra, hapusMitra } from "@/app/actions/mitra";

type Mitra = {
  email_mitra: string;
  id_penyedia: number;
  nama_mitra: string;
  tanggal_kerja_sama: string;
};

export default function KelolaMitra() {
  const [mitraList, setMitraList] = useState<Mitra[]>([]);
  const [showTambah, setShowTambah] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showHapus, setShowHapus] = useState(false);
  const [selectedMitra, setSelectedMitra] = useState<Mitra | null>(null);
  const [pesan, setPesan] = useState("");

  const [form, setForm] = useState({
    email_mitra: "",
    nama_mitra: "",
    tanggal_kerja_sama: "",
  });

  // Fetch data saat halaman dimuat
  useEffect(() => {
    fetchMitra();
  }, []);

  async function fetchMitra() {
    const res = await getMitra();
    if (res.success && res.data) setMitraList(res.data);
  }

  async function handleTambah() {
    if (!form.email_mitra || !form.nama_mitra || !form.tanggal_kerja_sama) {
      setPesan("Harap isi semua field yang wajib!");
      return;
    }
    const res = await tambahMitra({
      email_mitra: form.email_mitra,
      nama_mitra: form.nama_mitra,
      tanggal_kerja_sama: form.tanggal_kerja_sama,
    });
    setPesan(res.message || "");
    if (res.success) {
      setShowTambah(false);
      setForm({ email_mitra: "", nama_mitra: "", tanggal_kerja_sama: "" });
      fetchMitra();
    }
  }

  async function handleEdit() {
    if (!selectedMitra) return;
    if (!form.nama_mitra || !form.tanggal_kerja_sama) {
      setPesan("Harap isi semua field!");
      return;
    }
    const res = await updateMitra(selectedMitra.email_mitra, {
      nama_mitra: form.nama_mitra,
      tanggal_kerja_sama: form.tanggal_kerja_sama,
    });
    setPesan(res.message || "");
    if (res.success) {
      setShowEdit(false);
      fetchMitra();
    }
  }

  async function handleHapus() {
    if (!selectedMitra) return;
    const res = await hapusMitra(selectedMitra.email_mitra);
    setPesan(res.message || "");
    if (res.success) {
      setShowHapus(false);
      fetchMitra();
    }
  }

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

      {/* Pesan sukses/error */}
      {pesan && (
        <div className={`mb-4 px-4 py-3 rounded text-sm font-medium ${pesan.includes("berhasil") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
          {pesan}
          <button onClick={() => setPesan("")} className="ml-4 font-bold">✕</button>
        </div>
      )}

      {/* Tombol Tambah */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setShowTambah(true); setForm({ email_mitra: "", nama_mitra: "", tanggal_kerja_sama: "" }); setPesan(""); }}
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