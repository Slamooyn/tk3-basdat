"use client";
import { useState, useEffect } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { getIdentitasByMember, addIdentitas, updateIdentitas, deleteIdentitas } from "@/app/actions/identitasmember";

type Identitas = {
    nomor: string;
    jenis: string;
    negara_penerbit: string;
    tanggal_terbit_raw: string;
    tanggal_habis_raw: string;
    tanggal_terbit: string;
    tanggal_habis: string;
    status: "Aktif" | "Kedaluwarsa";
};

function rowToIdentitas(row: any): Identitas {
    const habis = new Date(row.tanggal_habis);
    const terbit = new Date(row.tanggal_terbit);
    return {
        nomor: row.nomor,
        jenis: row.jenis,
        negara_penerbit: row.negara_penerbit,
        tanggal_terbit_raw: terbit.toISOString().split("T")[0],
        tanggal_habis_raw: habis.toISOString().split("T")[0],
        tanggal_terbit: terbit.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        tanggal_habis: habis.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        status: habis < new Date() ? "Kedaluwarsa" : "Aktif",
    };
}

const TODAY = new Date().toISOString().split("T")[0];

const INITIAL_ADD = {
    nomor: "",
    jenis: "Paspor",
    negara_penerbit: "Indonesia",
    tanggal_terbit: TODAY,
    tanggal_habis: "",
};

type EditForm = {
    nomor: string;
    jenis: string;
    negara_penerbit: string;
    tanggal_terbit: string;
    tanggal_habis: string;
};

const inputCls = "w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

export default function Page() {
    const [email, setEmail] = useState("");
    const [data, setData] = useState<Identitas[]>([]);

    const [showAdd, setShowAdd] = useState(false);
    const [addForm, setAddForm] = useState(INITIAL_ADD);
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");

    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState<EditForm | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

    const [showDelete, setShowDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) return;
        const parsed = JSON.parse(stored);
        setEmail(parsed.email);
        getIdentitasByMember(parsed.email).then((res) => {
            if (res.success) setData(res.data.map(rowToIdentitas));
        });
    }, []);

    const refetch = async () => {
        if (!email) return;
        const res = await getIdentitasByMember(email);
        if (res.success) setData(res.data.map(rowToIdentitas));
    };

    const handleAdd = async () => {
        setAddError("");
        if (!addForm.nomor || !addForm.tanggal_habis) {
            setAddError("Nomor dokumen dan tanggal habis wajib diisi.");
            return;
        }
        setAddLoading(true);
        const result = await addIdentitas({ email_member: email, ...addForm });
        setAddLoading(false);
        if (!result.success) { setAddError(result.message); return; }
        await refetch();
        setAddForm({ ...INITIAL_ADD, tanggal_terbit: TODAY });
        setShowAdd(false);
    };

    const openEdit = (item: Identitas) => {
        setEditForm({
            nomor: item.nomor,
            jenis: item.jenis,
            negara_penerbit: item.negara_penerbit,
            tanggal_terbit: item.tanggal_terbit_raw,
            tanggal_habis: item.tanggal_habis_raw,
        });
        setEditError("");
        setShowEdit(true);
    };

    const handleEdit = async () => {
        if (!editForm) return;
        setEditError("");
        if (!editForm.tanggal_habis) {
            setEditError("Tanggal habis wajib diisi.");
            return;
        }
        setEditLoading(true);
        const result = await updateIdentitas(editForm.nomor, {
            jenis: editForm.jenis,
            negara_penerbit: editForm.negara_penerbit,
            tanggal_terbit: editForm.tanggal_terbit,
            tanggal_habis: editForm.tanggal_habis,
        });
        setEditLoading(false);
        if (!result.success) { setEditError(result.message); return; }
        await refetch();
        setShowEdit(false);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        const result = await deleteIdentitas(deleteTarget);
        setDeleteLoading(false);
        if (!result.success) { alert(result.message); return; }
        setData((prev) => prev.filter((d) => d.nomor !== deleteTarget));
        setShowDelete(false);
        setDeleteTarget(null);
    };

    const fieldAdd = (key: keyof typeof INITIAL_ADD, value: string) =>
        setAddForm((p) => ({ ...p, [key]: value }));
    const fieldEdit = (key: keyof EditForm, value: string) =>
        setEditForm((p) => p ? { ...p, [key]: value } : p);

    const statusBadge = (status: string) =>
        status === "Aktif"
            ? "bg-green-500 text-white px-3 py-1 rounded-full text-xs"
            : "bg-red-500 text-white px-3 py-1 rounded-full text-xs";

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">Identitas Saya</h1>
                <button
                    onClick={() => { setAddForm({ ...INITIAL_ADD, tanggal_terbit: TODAY }); setAddError(""); setShowAdd(true); }}
                    className="bg-[var(--color-navy-dark)] text-white px-4 py-2 rounded-md flex items-center gap-2 shadow"
                >
                    <span className="text-lg">+</span> Tambah Identitas
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border">
                <table className="w-full text-sm">
                    <thead className="text-gray-500 border-b">
                        <tr>
                            <th className="p-4 text-left">No. Dokumen</th>
                            <th className="p-4 text-left">Jenis</th>
                            <th className="p-4 text-left">Negara</th>
                            <th className="p-4 text-left">Terbit</th>
                            <th className="p-4 text-left">Habis</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-left">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr><td colSpan={7} className="p-8 text-center text-gray-400">Belum ada identitas terdaftar.</td></tr>
                        ) : data.map((item, i) => (
                            <tr key={i} className="border-t hover:bg-gray-50">
                                <td className="p-4 font-medium">{item.nomor}</td>
                                <td className="p-4">{item.jenis}</td>
                                <td className="p-4">{item.negara_penerbit}</td>
                                <td className="p-4">{item.tanggal_terbit}</td>
                                <td className="p-4">{item.tanggal_habis}</td>
                                <td className="p-4"><span className={statusBadge(item.status)}>{item.status}</span></td>
                                <td className="p-4 flex gap-3">
                                    <FiEdit className="cursor-pointer text-gray-600 hover:text-black" onClick={() => openEdit(item)} />
                                    <FiTrash2 className="cursor-pointer text-red-500 hover:text-red-700"
                                        onClick={() => { setDeleteTarget(item.nomor); setShowDelete(true); }} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL EDIT */}
            {showEdit && editForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[520px] rounded-2xl p-6 shadow-xl relative">
                        <button onClick={() => setShowEdit(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">✕</button>
                        <h2 className="text-lg font-semibold mb-4">Edit Identitas</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-600">Nomor Dokumen</label>
                                <input value={editForm.nomor} disabled className={`${inputCls} bg-gray-100 cursor-not-allowed`} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Jenis Dokumen</label>
                                <select value={editForm.jenis} onChange={(e) => fieldEdit("jenis", e.target.value)} className={inputCls}>
                                    <option>Paspor</option><option>KTP</option><option>SIM</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Negara Penerbit</label>
                                <select value={editForm.negara_penerbit} onChange={(e) => fieldEdit("negara_penerbit", e.target.value)} className={inputCls}>
                                    <option>Indonesia</option><option>Malaysia</option><option>Singapore</option><option>Other</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-gray-600">Tanggal Terbit</label>
                                    <input type="date" value={editForm.tanggal_terbit} disabled className={`${inputCls} bg-gray-100 cursor-not-allowed`} />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Tanggal Habis</label>
                                    <input type="date" value={editForm.tanggal_habis} onChange={(e) => fieldEdit("tanggal_habis", e.target.value)} className={inputCls} />
                                </div>
                            </div>
                            {editError && <p className="text-red-500 text-sm">{editError}</p>}
                            <div className="flex justify-end pt-2">
                                <button onClick={handleEdit} disabled={editLoading}
                                    className="bg-[var(--color-navy-dark)] text-white px-5 py-2 rounded-lg shadow disabled:opacity-50">
                                    {editLoading ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TAMBAH */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[520px] rounded-2xl p-6 shadow-xl relative">
                        <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">✕</button>
                        <h2 className="text-lg font-semibold mb-4">Tambah Identitas Baru</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-600">Nomor Dokumen</label>
                                <input value={addForm.nomor} onChange={(e) => fieldAdd("nomor", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Jenis Dokumen</label>
                                <select value={addForm.jenis} onChange={(e) => fieldAdd("jenis", e.target.value)} className={inputCls}>
                                    <option>Paspor</option><option>KTP</option><option>SIM</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Negara Penerbit</label>
                                <select value={addForm.negara_penerbit} onChange={(e) => fieldAdd("negara_penerbit", e.target.value)} className={inputCls}>
                                    <option>Indonesia</option><option>Malaysia</option><option>Singapore</option><option>Other</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-gray-600">Tanggal Terbit</label>
                                    <input type="date" value={addForm.tanggal_terbit} disabled className={`${inputCls} bg-gray-100 cursor-not-allowed`} />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Tanggal Habis</label>
                                    <input type="date" value={addForm.tanggal_habis} onChange={(e) => fieldAdd("tanggal_habis", e.target.value)} className={inputCls} />
                                </div>
                            </div>
                            {addError && <p className="text-red-500 text-sm">{addError}</p>}
                            <div className="flex justify-end pt-2">
                                <button onClick={handleAdd} disabled={addLoading}
                                    className="bg-[var(--color-navy-dark)] text-white px-5 py-2 rounded-lg shadow disabled:opacity-50">
                                    {addLoading ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DELETE */}
            {showDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[420px] rounded-2xl p-6 shadow-xl">
                        <h2 className="text-lg font-semibold mb-2">Hapus Identitas?</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Dokumen <span className="font-medium text-gray-700">{deleteTarget}</span> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setShowDelete(false); setDeleteTarget(null); }}
                                className="px-4 py-2 rounded-lg border text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                            <button onClick={handleDelete} disabled={deleteLoading}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white shadow disabled:opacity-50">
                                {deleteLoading ? "Menghapus..." : "Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}