"use client";

import { useState } from "react";
import { FiSearch, FiEdit, FiTrash2 } from "react-icons/fi";
import { registerUser } from "@/app/actions/auth";

type Member = {
    id: string;
    name: string;
    email: string;
    tier: string;
    total: string;
    award: string;
    join: string;
};

const INITIAL_ADD = {
    email: "",
    password: "",
    salutation: "Mr.",
    namaDepan: "",
    namaTengah: "",
    last_name: "",
    country_code: "+62",
    mobile_number: "",
    tanggal_lahir: "",
    kewarganegaraan: "Indonesia",
};

export default function Page() {
    const [showEdit, setShowEdit] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [addForm, setAddForm] = useState(INITIAL_ADD);
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");

    const [members, setMembers] = useState<Member[]>([
        {
            id: "M0001",
            name: "Mr. John William Doe",
            email: "john@example.com",
            tier: "Gold",
            total: "45,000",
            award: "32,000",
            join: "2024-01-15",
        },
        {
            id: "M0002",
            name: "Mrs. Jane Smith",
            email: "jane@example.com",
            tier: "Silver",
            total: "20,000",
            award: "15,000",
            join: "2024-03-10",
        },
        {
            id: "M0003",
            name: "Mr. Budi Anto Santoso",
            email: "budi@example.com",
            tier: "Blue",
            total: "5,000",
            award: "3,500",
            join: "2024-06-20",
        },
        {
            id: "M0004",
            name: "Mr. John Lennon",
            email: "johnlennon@gmail.com",
            tier: "Blue",
            total: "0",
            award: "0",
            join: "2026-04-12",
        },
    ]);

    // ── HANDLER TAMBAH MEMBER ────────────────────────────────────────
    const handleTambahMember = async () => {
        setAddError("");

        if (!addForm.email || !addForm.password || !addForm.namaDepan || !addForm.last_name || !addForm.tanggal_lahir || !addForm.mobile_number) {
            setAddError("Email, password, nama depan, nama belakang, nomor HP, dan tanggal lahir wajib diisi.");
            return;
        }

        setAddLoading(true);

        // Gabungkan nama depan + tengah → first_mid_name
        const first_mid_name = addForm.namaTengah
            ? `${addForm.namaDepan} ${addForm.namaTengah}`
            : addForm.namaDepan;

        const result = await registerUser({
            email: addForm.email,
            password: addForm.password,
            salutation: addForm.salutation,
            first_mid_name,
            last_name: addForm.last_name,
            country_code: addForm.country_code,
            mobile_number: addForm.mobile_number,
            tanggal_lahir: addForm.tanggal_lahir,
            kewarganegaraan: addForm.kewarganegaraan,
            role: "member",
        });

        setAddLoading(false);

        if (!result.success) {
            setAddError(result.message ?? "Gagal menambah member.");
            return;
        }

        // Update list di state — nomor_member dari DB tidak kita tahu,
        // pakai panjang list + 1 sebagai placeholder sampai halaman di-refresh
        const newMember: Member = {
            id: `M${String(members.length + 1).padStart(4, "0")}`,
            name: `${addForm.salutation} ${first_mid_name} ${addForm.last_name}`.trim(),
            email: addForm.email,
            tier: "Blue",
            total: "0",
            award: "0",
            join: new Date().toISOString().split("T")[0],
        };

        setMembers((prev) => [...prev, newMember]);
        setAddForm(INITIAL_ADD);
        setShowAdd(false);
    };

    const field = (key: keyof typeof addForm, value: string) =>
        setAddForm((prev) => ({ ...prev, [key]: value }));

    const badge = (tier: string) => {
        if (tier === "Gold")
            return "bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-medium";
        if (tier === "Silver")
            return "bg-gray-300 text-black px-3 py-1 rounded-full text-xs font-medium";
        return "bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium";
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">Kelola Member</h1>
                <button
                    onClick={() => { setAddForm(INITIAL_ADD); setAddError(""); setShowAdd(true); }}
                    className="bg-[var(--color-navy-dark)] text-white px-4 py-2 rounded-md flex items-center gap-2 shadow"
                >
                    <span className="text-lg">+</span>
                    Tambah Member
                </button>
            </div>

            <div className="flex gap-3 mb-4">
                <div className="flex items-center bg-white border rounded-lg px-3 py-2 w-full shadow-sm">
                    <FiSearch className="text-gray-400 mr-2" />
                    <input
                        placeholder="Cari nama, email, atau nomor member..."
                        className="w-full outline-none text-sm"
                    />
                </div>
                <select className="bg-white border rounded-lg px-4 py-2 text-sm shadow-sm">
                    <option>Semua Tier</option>
                </select>
            </div>

            {/* TABLE */}
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
                        {members.map((m, i) => (
                            <tr key={i} className="border-t hover:bg-gray-50">
                                <td className="p-4 font-medium">{m.id}</td>
                                <td className="p-4">{m.name}</td>
                                <td className="p-4">{m.email}</td>
                                <td className="p-4">
                                    <span className={badge(m.tier)}>{m.tier}</span>
                                </td>
                                <td className="p-4">{m.total}</td>
                                <td className="p-4">{m.award}</td>
                                <td className="p-4">{m.join}</td>
                                <td className="p-4 flex gap-3">
                                    <FiEdit
                                        className="cursor-pointer text-gray-600 hover:text-black"
                                        onClick={() => { setSelectedMember(m); setShowEdit(true); }}
                                    />
                                    <FiTrash2
                                        className="cursor-pointer text-red-500 hover:text-red-700"
                                        onClick={() => { setSelectedId(m.id); setShowDelete(true); }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── MODAL EDIT ── */}
            {showEdit && selectedMember && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-[720px] rounded-2xl p-8 relative shadow-xl">
                        <button onClick={() => setShowEdit(false)} className="absolute right-5 top-4 text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        <h2 className="text-xl font-semibold mb-6">Edit Member</h2>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                            <div className="col-span-2">
                                <label className="text-sm text-gray-600 block mb-1">Salutation</label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm">
                                    <option>Mr.</option><option>Mrs.</option><option>Ms.</option><option>Dr.</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Nama Depan</label>
                                <input defaultValue="John" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Nama Tengah</label>
                                <input defaultValue="William" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Nama Belakang</label>
                                <input defaultValue="Doe" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Kewarganegaraan</label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm">
                                    <option>Indonesia</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Country Code</label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm">
                                    <option>+62</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Nomor HP</label>
                                <input defaultValue="81234567890" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Tanggal Lahir</label>
                                <input type="date" defaultValue="1990-05-15" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Tier</label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm">
                                    <option>Gold</option><option>Silver</option><option>Blue</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-8">
                            <button className="bg-[var(--color-navy-dark)] text-white px-6 py-2.5 rounded-xl shadow hover:opacity-90">Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL TAMBAH MEMBER ── */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-[720px] rounded-2xl p-8 relative shadow-xl">
                        <button onClick={() => setShowAdd(false)} className="absolute right-5 top-4 text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        <h2 className="text-xl font-semibold mb-6">Tambah Member Baru</h2>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Email</label>
                                <input
                                    value={addForm.email}
                                    onChange={(e) => field("email", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Password</label>
                                <input
                                    type="password"
                                    value={addForm.password}
                                    onChange={(e) => field("password", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="text-sm text-gray-600 block mb-1">Salutation</label>
                                <select
                                    value={addForm.salutation}
                                    onChange={(e) => field("salutation", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm"
                                >
                                    <option>Mr.</option><option>Mrs.</option><option>Ms.</option><option>Dr.</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Nama Depan</label>
                                <input
                                    value={addForm.namaDepan}
                                    onChange={(e) => field("namaDepan", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Nama Tengah <span className="text-gray-400">(opsional)</span></label>
                                <input
                                    value={addForm.namaTengah}
                                    onChange={(e) => field("namaTengah", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Nama Belakang</label>
                                <input
                                    value={addForm.last_name}
                                    onChange={(e) => field("last_name", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Kewarganegaraan</label>
                                <select
                                    value={addForm.kewarganegaraan}
                                    onChange={(e) => field("kewarganegaraan", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm"
                                >
                                    <option>Indonesia</option>
                                    <option>Malaysia</option>
                                    <option>Singapore</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Country Code</label>
                                <select
                                    value={addForm.country_code}
                                    onChange={(e) => field("country_code", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm"
                                >
                                    <option>+62</option>
                                    <option>+60</option>
                                    <option>+65</option>
                                    <option>+1</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Nomor HP</label>
                                <input
                                    value={addForm.mobile_number}
                                    onChange={(e) => field("mobile_number", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Tanggal Lahir</label>
                                <input
                                    type="date"
                                    value={addForm.tanggal_lahir}
                                    onChange={(e) => field("tanggal_lahir", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm"
                                />
                            </div>
                        </div>

                        {addError && (
                            <p className="text-red-500 text-sm mt-4">{addError}</p>
                        )}

                        <div className="flex justify-end mt-8">
                            <button
                                onClick={handleTambahMember}
                                disabled={addLoading}
                                className="bg-[var(--color-navy-dark)] text-white px-6 py-2.5 rounded-xl shadow hover:opacity-90 disabled:opacity-50"
                            >
                                {addLoading ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL DELETE ── */}
            {showDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-[520px] rounded-2xl p-6 shadow-xl">
                        <h2 className="text-lg font-semibold mb-2">Hapus Member?</h2>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Semua data terkait (Identitas, Klaim, Transfer, Redeem) akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDelete(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Batal</button>
                            <button
                                onClick={() => { setShowDelete(false); }}
                                className="px-5 py-2 bg-[var(--color-navy-dark)] text-white rounded-lg text-sm shadow"
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