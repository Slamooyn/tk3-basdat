"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiEdit, FiTrash2 } from "react-icons/fi";
import { registerUser, getAllMembers, updateMember, deleteMember } from "@/app/actions/auth";

type Member = {
    id: string;
    name: string;
    email: string;
    tier: string;
    total: number;
    award: number;
    join: string;
    salutation: string;
    first_mid_name: string;
    last_name: string;
    kewarganegaraan: string;
    country_code: string;
    mobile_number: string;
    tanggal_lahir: string;
};

function rowToMember(row: any): Member {
    return {
        id: row.id,
        name: `${row.salutation} ${row.first_mid_name} ${row.last_name}`.trim(),
        email: row.email,
        tier: row.tier,
        total: row.total,
        award: row.award,
        join: row.join
            ? new Date(row.join).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            })
            : "-",
        salutation: row.salutation,
        first_mid_name: row.first_mid_name,
        last_name: row.last_name,
        kewarganegaraan: row.kewarganegaraan,
        country_code: row.country_code,
        mobile_number: row.mobile_number,
        tanggal_lahir: row.tanggal_lahir
            ? new Date(row.tanggal_lahir).toISOString().split("T")[0]
            : "",
    };
}

const TIER_MAP: Record<string, string> = {
    Gold: "TIER-GLD",
    Silver: "TIER-SLV",
    Blue: "TIER-BLU",
};

const INITIAL_ADD = {
    email: "", password: "", salutation: "Mr.",
    namaDepan: "", namaTengah: "", last_name: "",
    country_code: "+62", mobile_number: "",
    tanggal_lahir: "", kewarganegaraan: "Indonesia",
};

type EditForm = {
    email: string;
    salutation: string;
    namaDepan: string;
    namaTengah: string;
    last_name: string;
    kewarganegaraan: string;
    country_code: string;
    mobile_number: string;
    tanggal_lahir: string;
    tier: string;
};

export default function Page() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [search, setSearch] = useState("");
    const [filterTier, setFilterTier] = useState("Semua Tier");

    // Add
    const [showAdd, setShowAdd] = useState(false);
    const [addForm, setAddForm] = useState(INITIAL_ADD);
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");

    // Edit
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState<EditForm | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

    // Delete
    const [showDelete, setShowDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const filteredMembers = members.filter((m) => {
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.mobile_number.toLowerCase().includes(q) ||
            m.id.toLowerCase().includes(q);
        const matchTier = filterTier === "Semua Tier" || m.tier === filterTier;
        return matchSearch && matchTier;
    });

    useEffect(() => {
        getAllMembers().then((res) => {
            if (res.success) setMembers(res.data.map(rowToMember));
            setLoadingMembers(false);
        });
    }, []);

    const refetch = async () => {
        const res = await getAllMembers();
        if (res.success) setMembers(res.data.map(rowToMember));
    };

    const handleTambahMember = async () => {
        setAddError("");
        if (!addForm.email || !addForm.password || !addForm.namaDepan || !addForm.last_name || !addForm.tanggal_lahir || !addForm.mobile_number) {
            setAddError("Email, password, nama depan, nama belakang, nomor HP, dan tanggal lahir wajib diisi.");
            return;
        }
        setAddLoading(true);
        const first_mid_name = addForm.namaTengah
            ? `${addForm.namaDepan} ${addForm.namaTengah}`
            : addForm.namaDepan;
        const result = await registerUser({
            email: addForm.email, password: addForm.password,
            salutation: addForm.salutation, first_mid_name,
            last_name: addForm.last_name, country_code: addForm.country_code,
            mobile_number: addForm.mobile_number, tanggal_lahir: addForm.tanggal_lahir,
            kewarganegaraan: addForm.kewarganegaraan, role: "member",
        });
        setAddLoading(false);
        if (!result.success) { setAddError(result.message); return; }
        await refetch();
        setAddForm(INITIAL_ADD);
        setShowAdd(false);
    };

    const openEdit = (m: Member) => {
        const parts = m.first_mid_name.trim().split(" ");
        setEditForm({
            email: m.email,
            salutation: m.salutation,
            namaDepan: parts[0] ?? "",
            namaTengah: parts.slice(1).join(" "),
            last_name: m.last_name,
            kewarganegaraan: m.kewarganegaraan,
            country_code: m.country_code,
            mobile_number: m.mobile_number,
            tanggal_lahir: m.tanggal_lahir
                ? new Date(m.tanggal_lahir).toISOString().split("T")[0]
                : "",
            tier: TIER_MAP[m.tier] ?? "TIER-BLU",
        });
        setEditError("");
        setShowEdit(true);
    };

    const handleEditMember = async () => {
        if (!editForm) return;
        setEditError("");
        if (!editForm.namaDepan || !editForm.last_name || !editForm.mobile_number || !editForm.tanggal_lahir) {
            setEditError("Nama depan, nama belakang, nomor HP, dan tanggal lahir wajib diisi.");
            return;
        }
        setEditLoading(true);
        const first_mid_name = editForm.namaTengah
            ? `${editForm.namaDepan} ${editForm.namaTengah}`
            : editForm.namaDepan;
        const result = await updateMember(editForm.email, {
            salutation: editForm.salutation, first_mid_name,
            last_name: editForm.last_name, kewarganegaraan: editForm.kewarganegaraan,
            country_code: editForm.country_code, mobile_number: editForm.mobile_number,
            tanggal_lahir: editForm.tanggal_lahir, id_tier: editForm.tier,
        });
        setEditLoading(false);
        if (!result.success) { setEditError(result.message); return; }
        await refetch();
        setShowEdit(false);
    };

    const handleDeleteMember = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        const result = await deleteMember(deleteTarget.email);
        setDeleteLoading(false);
        if (!result.success) { alert(result.message); return; }
        setMembers((prev) => prev.filter((m) => m.email !== deleteTarget.email));
        setShowDelete(false);
        setDeleteTarget(null);
    };

    const fieldAdd = (key: keyof typeof INITIAL_ADD, value: string) =>
        setAddForm((p) => ({ ...p, [key]: value }));
    const fieldEdit = (key: keyof EditForm, value: string) =>
        setEditForm((p) => p ? { ...p, [key]: value } : p);

    const badge = (tier: string) => {
        if (tier === "Gold") return "bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-medium";
        if (tier === "Silver") return "bg-gray-300 text-black px-3 py-1 rounded-full text-xs font-medium";
        return "bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium";
    };

    const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">Kelola Member</h1>
                <button
                    onClick={() => { setAddForm(INITIAL_ADD); setAddError(""); setShowAdd(true); }}
                    className="bg-[var(--color-navy-dark)] text-white px-4 py-2 rounded-md flex items-center gap-2 shadow"
                >
                    <span className="text-lg">+</span> Tambah Member
                </button>
            </div>

            <div className="flex gap-3 mb-4">
                <div className="flex items-center bg-white border rounded-lg px-3 py-2 w-full shadow-sm">
                    <FiSearch className="text-gray-400 mr-2" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama, email, nomor HP, atau nomor member..."
                        className="w-full outline-none text-sm"
                    />
                </div>
                <select
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    className="bg-white border rounded-lg px-4 py-2 text-sm shadow-sm"
                >
                    <option>Semua Tier</option>
                    <option>Gold</option>
                    <option>Silver</option>
                    <option>Blue</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow border">
                <table className="w-full text-sm">
                    <thead className="text-gray-500 border-b">
                        <tr>
                            <th className="p-4 text-left">No. Member</th>
                            <th className="p-4 text-left">Nama</th>
                            <th className="p-4 text-left">Email</th>
                            <th className="p-4 text-left">Tier</th>
                            <th className="p-4 text-left">Total Miles</th>
                            <th className="p-4 text-left">Award Miles</th>
                            <th className="p-4 text-left">Bergabung</th>
                            <th className="p-4 text-left">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingMembers ? (
                            <tr><td colSpan={8} className="p-8 text-center text-gray-400">Memuat data...</td></tr>
                        ) : filteredMembers.length === 0 ? (
                            <tr><td colSpan={8} className="p-8 text-center text-gray-400">
                                {members.length === 0 ? "Belum ada member terdaftar." : "Tidak ada member yang cocok."}
                            </td></tr>
                        ) : filteredMembers.map((m, i) => (
                            <tr key={i} className="border-t hover:bg-gray-50">
                                <td className="p-4 font-medium">{m.id}</td>
                                <td className="p-4">{m.name}</td>
                                <td className="p-4">{m.email}</td>
                                <td className="p-4"><span className={badge(m.tier)}>{m.tier}</span></td>
                                <td className="p-4">{Number(m.total).toLocaleString("id-ID")}</td>
                                <td className="p-4">{Number(m.award).toLocaleString("id-ID")}</td>
                                <td className="p-4">{m.join}</td>
                                <td className="p-4 flex gap-3">
                                    <FiEdit className="cursor-pointer text-gray-600 hover:text-black" onClick={() => openEdit(m)} />
                                    <FiTrash2 className="cursor-pointer text-red-500 hover:text-red-700"
                                        onClick={() => { setDeleteTarget({ id: m.id, email: m.email }); setShowDelete(true); }} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showEdit && editForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[720px] rounded-2xl p-8 relative shadow-xl">
                        <button onClick={() => setShowEdit(false)} className="absolute right-5 top-4 text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        <h2 className="text-xl font-semibold mb-6">Edit Member</h2>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                            <div className="col-span-2">
                                <label className="text-sm text-gray-600 block mb-1">Salutation</label>
                                <select value={editForm.salutation} onChange={(e) => fieldEdit("salutation", e.target.value)} className={inputCls}>
                                    <option>Mr.</option><option>Mrs.</option><option>Ms.</option><option>Dr.</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Nama Depan</label>
                                <input value={editForm.namaDepan} onChange={(e) => fieldEdit("namaDepan", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Nama Belakang</label>
                                <input value={editForm.last_name} onChange={(e) => fieldEdit("last_name", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Kewarganegaraan</label>
                                <select value={editForm.kewarganegaraan} onChange={(e) => fieldEdit("kewarganegaraan", e.target.value)} className={inputCls}>
                                    <option>Indonesia</option><option>Malaysia</option><option>Singapore</option><option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Country Code</label>
                                <select value={editForm.country_code} onChange={(e) => fieldEdit("country_code", e.target.value)} className={inputCls}>
                                    <option>+62</option><option>+60</option><option>+65</option><option>+1</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Nomor HP</label>
                                <input value={editForm.mobile_number} onChange={(e) => fieldEdit("mobile_number", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Tanggal Lahir</label>
                                <input type="date" value={editForm.tanggal_lahir} onChange={(e) => fieldEdit("tanggal_lahir", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Tier</label>
                                <select value={editForm.tier} onChange={(e) => fieldEdit("tier", e.target.value)} className={inputCls}>
                                    <option value="TIER-GLD">Gold</option>
                                    <option value="TIER-SLV">Silver</option>
                                    <option value="TIER-BLU">Blue</option>
                                </select>
                            </div>
                        </div>
                        {editError && <p className="text-red-500 text-sm mt-4">{editError}</p>}
                        <div className="flex justify-end mt-8">
                            <button onClick={handleEditMember} disabled={editLoading}
                                className="bg-[var(--color-navy-dark)] text-white px-6 py-2.5 rounded-xl shadow hover:opacity-90 disabled:opacity-50">
                                {editLoading ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL TAMBAH ── */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[720px] rounded-2xl p-8 relative shadow-xl">
                        <button onClick={() => setShowAdd(false)} className="absolute right-5 top-4 text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        <h2 className="text-xl font-semibold mb-6">Tambah Member Baru</h2>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Email</label>
                                <input value={addForm.email} onChange={(e) => fieldAdd("email", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Password</label>
                                <input type="password" value={addForm.password} onChange={(e) => fieldAdd("password", e.target.value)} className={inputCls} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm text-gray-600 block mb-1">Salutation</label>
                                <select value={addForm.salutation} onChange={(e) => fieldAdd("salutation", e.target.value)} className={inputCls}>
                                    <option>Mr.</option><option>Mrs.</option><option>Ms.</option><option>Dr.</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Nama Depan</label>
                                <input value={addForm.namaDepan} onChange={(e) => fieldAdd("namaDepan", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Nama Belakang</label>
                                <input value={addForm.last_name} onChange={(e) => fieldAdd("last_name", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Kewarganegaraan</label>
                                <select value={addForm.kewarganegaraan} onChange={(e) => fieldAdd("kewarganegaraan", e.target.value)} className={inputCls}>
                                    <option>Indonesia</option><option>Malaysia</option><option>Singapore</option><option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Country Code</label>
                                <select value={addForm.country_code} onChange={(e) => fieldAdd("country_code", e.target.value)} className={inputCls}>
                                    <option>+62</option><option>+60</option><option>+65</option><option>+1</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Nomor HP</label>
                                <input value={addForm.mobile_number} onChange={(e) => fieldAdd("mobile_number", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Tanggal Lahir</label>
                                <input type="date" value={addForm.tanggal_lahir} onChange={(e) => fieldAdd("tanggal_lahir", e.target.value)} className={inputCls} />
                            </div>
                        </div>
                        {addError && <p className="text-red-500 text-sm mt-4">{addError}</p>}
                        <div className="flex justify-end mt-8">
                            <button onClick={handleTambahMember} disabled={addLoading}
                                className="bg-[var(--color-navy-dark)] text-white px-6 py-2.5 rounded-xl shadow hover:opacity-90 disabled:opacity-50">
                                {addLoading ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showDelete && deleteTarget && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[520px] rounded-2xl p-6 shadow-xl">
                        <h2 className="text-lg font-semibold mb-2">Hapus Member?</h2>
                        <p className="text-sm text-gray-500 mb-1">
                            Member <span className="font-medium text-gray-700">{deleteTarget.id}</span> akan dihapus permanen.
                        </p>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Semua data terkait (Identitas, Klaim, Transfer, Redeem) akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setShowDelete(false); setDeleteTarget(null); }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Batal</button>
                            <button onClick={handleDeleteMember} disabled={deleteLoading}
                                className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm shadow disabled:opacity-50">
                                {deleteLoading ? "Menghapus..." : "Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}