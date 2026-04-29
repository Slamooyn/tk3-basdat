"use client";

import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function Page() {
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

        <button className="bg-[var(--color-navy-dark)] text-white px-4 py-2 rounded-md flex items-center gap-2 shadow">
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
                  <FiEdit className="cursor-pointer text-gray-600 hover:text-black" />
                  <FiTrash2 className="cursor-pointer text-red-500 hover:text-red-700" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}