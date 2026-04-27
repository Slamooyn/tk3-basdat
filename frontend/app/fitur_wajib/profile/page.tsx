"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold mb-4">
          Pengaturan Profil
        </h1>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Data Profil</h2>

          {/* EMAIL */}
          <label className="text-sm">Email</label>
          <input
            value={user.email}
            disabled
            className="w-full mt-1 mb-3 px-3 py-2 border rounded-md bg-gray-100"
          />

          {/* 🔥 ROLE BASED FIELD */}
          {user.role === "member" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Nomor Member</label>
                <input
                  value={user.memberId}
                  disabled
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm">Tanggal Bergabung</label>
                <input
                  value={user.join}
                  disabled
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm">ID Staf</label>
              <input
                value={user.staffId}
                disabled
                className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100"
              />
            </div>
          )}

          {/* SALUTATION */}
          <label className="text-sm mt-3 block">Salutation</label>
          <select className="w-full mt-1 mb-3 px-3 py-2 border rounded-md">
            <option>Mr.</option>
            <option>Mrs.</option>
          </select>

          {/* NAMA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Nama Depan</label>
              <input
                defaultValue={user.name?.split(" ")[1] || ""}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm">Nama Tengah</label>
              <input
                defaultValue={user.name?.split(" ")[2] || ""}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-sm">Nama Belakang</label>
              <input
                defaultValue={user.name?.split(" ")[3] || ""}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm">Kewarganegaraan</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-md">
                <option>{user.country}</option>
              </select>
            </div>
          </div>

          {/* CONTACT */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-sm">Country Code</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-md">
                <option>+62</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Nomor HP</label>
              <input
                defaultValue={user.phone}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          {/* BIRTH */}
          <div className="mt-3">
            <label className="text-sm">Tanggal Lahir</label>
            <input
              type="date"
              defaultValue={user.birth}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          {/* 🔥 STAFF EXTRA */}
          {user.role === "staff" && (
            <div className="mt-3">
              <label className="text-sm">Kode Maskapai</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-md">
                <option>{user.airline}</option>
              </select>
            </div>
          )}

          <button className="mt-6 bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:bg-[var(--color-primary-dark)]">
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}