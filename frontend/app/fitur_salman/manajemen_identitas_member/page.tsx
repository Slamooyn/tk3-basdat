"use client";
import { useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function Page() {
    const [showEdit, setShowEdit] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const data = [
        {
            no: "A12345678",
            jenis: "Paspor",
            negara: "Indonesia",
            terbit: "2020-01-15",
            habis: "2030-01-15",
            status: "Aktif",
        },
        {
            no: "3275012345678901",
            jenis: "KTP",
            negara: "Indonesia",
            terbit: "2019-06-01",
            habis: "2024-06-01",
            status: "Kedaluwarsa",
        },
    ];

    const statusBadge = (status: string) => {
        if (status === "Aktif") {
            return "bg-green-500 text-white px-3 py-1 rounded-full text-xs";
        }
        return "bg-red-500 text-white px-3 py-1 rounded-full text-xs";
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">Identitas Saya</h1>

                <button
                    onClick={() => setShowAdd(true)}
                    className="bg-[var(--color-navy-dark)] text-white px-4 py-2 rounded-md flex items-center gap-2 shadow"
                >
                    <span className="text-lg">+</span>
                    Tambah Identitas
                </button>
            </div>

            {/* TABLE */}
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
                        {data.map((item, i) => (
                            <tr key={i} className="border-t hover:bg-gray-50">
                                <td className="p-4 font-medium">{item.no}</td>
                                <td className="p-4">{item.jenis}</td>
                                <td className="p-4">{item.negara}</td>
                                <td className="p-4">{item.terbit}</td>
                                <td className="p-4">{item.habis}</td>
                                <td className="p-4">
                                    <span className={statusBadge(item.status)}>
                                        {item.status}
                                    </span>
                                </td>

                                <td className="p-4 flex gap-3">
                                    <FiEdit
                                        className="cursor-pointer text-gray-600 hover:text-black"
                                        onClick={() => {
                                            setSelected(item);
                                            setShowEdit(true);
                                        }}
                                    />
                                    <FiTrash2
                                        className="cursor-pointer text-red-500 hover:text-red-700"
                                        onClick={() => setShowDelete(true)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL (dipindah keluar tbody) */}
            {showEdit && selected && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-[520px] rounded-2xl p-6 shadow-xl relative">

                        {/* CLOSE */}
                        <button
                            onClick={() => setShowEdit(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black"
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-semibold mb-4">
                            Edit Identitas
                        </h2>

                        {/* FORM */}
                        <div className="space-y-4">

                            <div>
                                <label className="text-sm text-gray-600">Nomor Dokumen</label>
                                <input
                                    defaultValue={selected.no}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600">Jenis Dokumen</label>
                                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                                    <option>SIM</option>
                                    <option>KTP</option>
                                    <option>Paspor</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600">Negara Penerbit</label>
                                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                                    <option>Indonesia</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-gray-600">Tanggal Terbit</label>
                                    <input
                                        type="date"
                                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-600">Tanggal Habis</label>
                                    <input
                                        type="date"
                                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* BUTTON */}
                            <div className="flex justify-end pt-2">
                                <button className="bg-[var(--color-navy-dark)] text-white px-5 py-2 rounded-lg shadow">
                                    Simpan
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}{showAdd && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-[520px] rounded-2xl p-6 shadow-xl relative">

                        {/* CLOSE */}
                        <button
                            onClick={() => setShowAdd(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black"
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-semibold mb-4">
                            Tambah Identitas Baru
                        </h2>

                        <div className="space-y-4">

                            <div>
                                <label className="text-sm text-gray-600">Nomor Dokumen</label>
                                <input
                                    defaultValue="SIM0001"
                                    className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600">Jenis Dokumen</label>
                                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                                    <option>SIM</option>
                                    <option>KTP</option>
                                    <option>Paspor</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600">Negara Penerbit</label>
                                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                                    <option>Indonesia</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-gray-600">Tanggal Terbit</label>
                                    <input
                                        type="date"
                                        defaultValue="2026-04-12"
                                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-600">Tanggal Habis</label>
                                    <input
                                        type="date"
                                        defaultValue="2031-04-12"
                                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* BUTTON */}
                            <div className="flex justify-end pt-2">
                                <button className="bg-[var(--color-navy-dark)] text-white px-5 py-2 rounded-lg shadow">
                                    Simpan
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}{showDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-[420px] rounded-2xl p-6 shadow-xl">

                        <h2 className="text-lg font-semibold mb-2">
                            Hapus Identitas?
                        </h2>

                        <p className="text-sm text-gray-500 mb-6">
                            Tindakan ini tidak dapat dibatalkan.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDelete(false)}
                                className="px-4 py-2 rounded-lg border text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Batal
                            </button>

                            <button
                                className="px-4 py-2 rounded-lg bg-[var(--color-navy-dark)] text-white shadow"
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