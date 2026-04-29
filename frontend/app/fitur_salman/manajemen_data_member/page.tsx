"use client";

import { useState } from "react";
import { FiSearch, FiEdit, FiTrash2 } from "react-icons/fi";

export default function Page() {
    const [showEdit, setShowEdit] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const members = [
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
    ];

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
                    onClick={() => setShowAdd(true)}
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
                                        onClick={() => {
                                            setSelectedMember(m);
                                            setShowEdit(true);
                                        }}
                                    />
                                    <FiTrash2
                                        className="cursor-pointer text-red-500 hover:text-red-700"
                                        onClick={() => {
                                            setSelectedId(m.id);
                                            setShowDelete(true);
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showEdit && selectedMember && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-[720px] rounded-2xl p-8 relative shadow-xl">
                        <button
                            onClick={() => setShowEdit(false)}
                            className="absolute right-5 top-4 text-gray-400 hover:text-gray-600 text-lg"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-semibold mb-6">
                            Edit Member
                        </h2>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                            <div className="col-span-2">
                                <label className="text-sm text-gray-600 block mb-1">
                                    Salutation
                                </label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                                    <option>Mr.</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Nama Depan
                                </label>
                                <input
                                    defaultValue="John"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Nama Tengah
                                </label>
                                <input
                                    defaultValue="William"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Nama Belakang
                                </label>
                                <input
                                    defaultValue="Doe"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Kewarganegaraan
                                </label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm">
                                    <option>Indonesia</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Country Code
                                </label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm">
                                    <option>+62</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Nomor HP
                                </label>
                                <input
                                    defaultValue="81234567890"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Tanggal Lahir
                                </label>
                                <input
                                    type="date"
                                    defaultValue="1990-05-15"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Tier
                                </label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm">
                                    <option>Gold</option>
                                    <option>Silver</option>
                                    <option>Blue</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-8">
                            <button className="bg-[var(--color-navy-dark)] text-white px-6 py-2.5 rounded-xl shadow hover:opacity-90">
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}{showAdd && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-[720px] rounded-2xl p-8 relative shadow-xl">

                        <button
                            onClick={() => setShowAdd(false)}
                            className="absolute right-5 top-4 text-gray-400 hover:text-gray-600 text-lg"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-semibold mb-6">
                            Tambah Member Baru
                        </h2>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Email
                                </label>
                                <input className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm" />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Password
                                </label>
                                <input type="password" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm text-gray-600 block mb-1">
                                    Salutation
                                </label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm">
                                    <option>Mr.</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Nama Depan
                                </label>
                                <input className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm" />
                            </div>

                            <div></div> {/* kosong sesuai desain */}

                            {/* NAMA BELAKANG */}
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Nama Belakang
                                </label>
                                <input className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm" />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Kewarganegaraan
                                </label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm">
                                    <option>Indonesia</option>
                                </select>
                            </div>

                            {/* PHONE */}
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Country Code
                                </label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm">
                                    <option>+62</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Nomor HP
                                </label>
                                <input className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm" />
                            </div>

                            {/* TANGGAL */}
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">
                                    Tanggal Lahir
                                </label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm"
                                />
                            </div>
                        </div>

                        {/* BUTTON */}
                        <div className="flex justify-end mt-8">
                            <button className="bg-[var(--color-navy-dark)] text-white px-6 py-2.5 rounded-xl shadow">
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}{showDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-[520px] rounded-2xl p-6 shadow-xl">

                        <h2 className="text-lg font-semibold mb-2">
                            Hapus Member?
                        </h2>

                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Semua data terkait (Identitas, Klaim, Transfer, Redeem) akan ikut
                            terhapus. Tindakan ini tidak dapat dibatalkan.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDelete(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                Batal
                            </button>

                            <button
                                onClick={() => {
                                    setShowDelete(false);
                                }}
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