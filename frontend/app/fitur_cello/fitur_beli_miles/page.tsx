"use client";

import { useState } from "react";

const dummyMember = {
  email: "john@example.com",
  nama: "Mr. John William Doe",
  awardMiles: 32000,
};

interface Package {
  id: string;
  jumlah_award_miles: number;
  harga_paket: number;
}

const dummyPackages: Package[] = [
  { id: "AMP-001", jumlah_award_miles: 1000, harga_paket: 150000 },
  { id: "AMP-002", jumlah_award_miles: 5000, harga_paket: 650000 },
  { id: "AMP-003", jumlah_award_miles: 10000, harga_paket: 1200000 },
  { id: "AMP-004", jumlah_award_miles: 25000, harga_paket: 2750000 },
];

export default function BeliPackage() {
  const [awardMiles, setAwardMiles] = useState(dummyMember.awardMiles);
  const [confirmPkg, setConfirmPkg] = useState<Package | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  function handleBeli(pkg: Package) {
    setConfirmPkg(pkg);
  }

  function konfirmasiBeli() {
    if (!confirmPkg) return;
    setAwardMiles((prev) => prev + confirmPkg.jumlah_award_miles);
    setSuccessMsg(
      `Berhasil membeli ${confirmPkg.jumlah_award_miles.toLocaleString("id-ID")} Award Miles!`
    );
    setConfirmPkg(null);
    setTimeout(() => setSuccessMsg(""), 3500);
  }

  function formatRupiah(val: number) {
    return "Rp " + val.toLocaleString("id-ID");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Beli Award Miles Package</h1>
        <p className="text-sm text-gray-500 mb-6">
          Award Miles saat ini:{" "}
          <span className="font-bold text-gray-800">{awardMiles.toLocaleString("id-ID")}</span>
        </p>

        {successMsg && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
            ✓ {successMsg}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {dummyPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 flex flex-col items-center p-5"
            >

              <div className="self-end mb-2">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {pkg.id}
                </span>
              </div>

              <div className="text-3xl mb-3 text-blue-300">🛒</div>

              <p className="text-2xl font-bold text-gray-800 mb-0.5">
                {pkg.jumlah_award_miles.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-gray-400 mb-3">Award Miles</p>

              <p className="text-sm font-semibold text-gray-700 mb-4">
                {formatRupiah(pkg.harga_paket)}
              </p>

              <button
                onClick={() => handleBeli(pkg)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 rounded-lg transition-colors"
              >
                Beli
              </button>
            </div>
          ))}
        </div>
      </div>

      {confirmPkg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Konfirmasi Pembelian</h2>
              <button
                onClick={() => setConfirmPkg(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Anda akan membeli paket miles berikut:
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-5 text-sm space-y-1">
              <p>
                Award Miles:{" "}
                <span className="font-bold text-blue-600">
                  +{confirmPkg.jumlah_award_miles.toLocaleString("id-ID")}
                </span>
              </p>
              <p>
                Harga:{" "}
                <span className="font-bold text-gray-800">
                  {formatRupiah(confirmPkg.harga_paket)}
                </span>
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmPkg(null)}
                className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={konfirmasiBeli}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold"
              >
                Konfirmasi Pembelian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
