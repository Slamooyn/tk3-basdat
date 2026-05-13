"use client";

import { useState, useEffect } from "react";
import { getHadiah, getPenyedia, tambahHadiah, updateHadiah, hapusHadiah } from "@/app/actions/hadiah";

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
  nama_penyedia: string;
};

export default function KelolaHadiah() {
  const [hadiahList, setHadiahList] = useState<Hadiah[]>([]);
  const [penyediaList, setPenyediaList] = useState<Penyedia[]>([]);
  const [showTambah, setShowTambah] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showHapus, setShowHapus] = useState(false);
  const [selectedHadiah, setSelectedHadiah] = useState<Hadiah | null>(null);
  const [filterPenyedia, setFilterPenyedia] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [pesan, setPesan] = useState("");

  const [form, setForm] = useState({
    nama: "",
    miles: "",
    deskripsi: "",
    valid_start_date: "",
    program_end: "",
    id_penyedia: "",
  });

  const today = new Date().toISOString().split("T")[0];

  // Fetch data saat halaman dimuat
  useEffect(() => {
    fetchHadiah();
    fetchPenyedia();
  }, []);

  async function fetchHadiah() {
    const res = await getHadiah();
    if (res.success && res.data) setHadiahList(res.data);
  }

  async function fetchPenyedia() {
    const res = await getPenyedia();
    if (res.success && res.data) setPenyediaList(res.data);
  }

  const getStatus = (program_end: string) => {
    return program_end >= today ? "aktif" : "tidak aktif";
  };

  const filteredHadiah = hadiahList.filter((h) => {
    const statusMatch = filterStatus === "semua" || getStatus(h.program_end) === filterStatus;
    const penyediaMatch = filterPenyedia === "semua" || h.id_penyedia === parseInt(filterPenyedia);
    return statusMatch && penyediaMatch;
  });

  async function handleTambah() {
    if (!form.nama || !form.miles || !form.valid_start_date || !form.program_end || !form.id_penyedia) {
      setPesan("Harap isi semua field yang wajib!");
      return;
    }
    const res = await tambahHadiah({
      nama: form.nama,
      miles: parseInt(form.miles),
      deskripsi: form.deskripsi,
      valid_start_date: form.valid_start_date,
      program_end: form.program_end,
      id_penyedia: parseInt(form.id_penyedia),
    });
    setPesan(res.message || "");
    if (res.success) {
      setShowTambah(false);
      setForm({ nama: "", miles: "", deskripsi: "", valid_start_date: "", program_end: "", id_penyedia: "" });
      fetchHadiah();
    }
  }

  async function handleEdit() {
    if (!selectedHadiah) return;
    const res = await updateHadiah(selectedHadiah.kode_hadiah, {
      nama: form.nama,
      miles: parseInt(form.miles),
      deskripsi: form.deskripsi,
      valid_start_date: form.valid_start_date,
      program_end: form.program_end,
      id_penyedia: parseInt(form.id_penyedia),
    });
    setPesan(res.message || "");
    if (res.success) {
      setShowEdit(false);
      fetchHadiah();
    }
  }

  async function handleHapus() {
    if (!selectedHadiah) return;
    const res = await hapusHadiah(selectedHadiah.kode_hadiah);
    setPesan(res.message || "");
    if (res.success) {
      setShowHapus(false);
      fetchHadiah();
    }
  }

  const openEdit = (h: Hadiah) => {
    setSelectedHadiah(h);
    setForm({
      nama: h.nama,
      miles: String(h.miles),
      deskripsi: h.deskripsi,
      valid_start_date: h.valid_start_date,
      program_end: h.program_end,
      id_penyedia: String(h.id_penyedia),
    });
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
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Hadiah & Penyedia</h1>
        <p className="text-sm text-gray-500">Masuk sebagai Staf</p>
      </div>

      {/* Pesan sukses/error */}
      {pesan && (
        <div className={`mb-4 px-4 py-3 rounded text-sm font-medium ${pesan.includes("berhasil") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
          {pesan}
          <button onClick={() => setPesan("")} className="ml-4 font-bold">✕</button>
        </div>
      )}

      {/* Filter & Tombol Tambah */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3">
          <select className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white" value={filterPenyedia} onChange={(e) => setFilterPenyedia(e.target.value)}>
            <option value="semua">Semua Penyedia</option>
            {penyediaList.map((p) => (
              <option key={p.id} value={p.id}>{p.nama}</option>
            ))}
          </select>
          <select className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="semua">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="tidak aktif">Tidak Aktif</option>
          </select>
        </div>
        <button onClick={() => { setShowTambah(true); setForm({ nama: "", miles: "", deskripsi: "", valid_start_date: "", program_end: "", id_penyedia: "" }); setPesan(""); }} className="bg-[#1a2e4a] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#243d61]">
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
              return (
                <tr key={h.kode_hadiah} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{h.kode_hadiah}</td>
                  <td className="px-4 py-3 text-gray-800">{h.nama}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{h.deskripsi}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{h.nama_penyedia}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{h.miles.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-gray-600">{h.valid_start_date} — {h.program_end}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${status === "aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {status === "aktif" ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(h)} className="text-blue-500 hover:text-blue-700 text-lg">✏️</button>
                    <button
                      onClick={() => status !== "aktif" ? openHapus(h) : setPesan("Hadiah masih aktif, tidak dapat dihapus!")}
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
                    {penyediaList.map((p) => (
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
                    {penyediaList.map((p) => (
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