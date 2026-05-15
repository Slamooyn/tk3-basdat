"use client";

import { useState, useEffect } from "react";
import { getDataTransfer, transferMiles } from "@/app/actions/transfer";

interface Transfer {
  email_member_1: string;
  email_member_2: string;
  nama_pengirim: string;
  nama_penerima: string;
  timestamp: string;
  jumlah: number;
  catatan: string;
}

const formatMiles = (n: number) => n.toLocaleString("id-ID");

export default function TransferMilesMember() {
  const [emailSaya, setEmailSaya] = useState<string>("");
  const [awardMiles, setAwardMiles] = useState<number>(0);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [emailPenerima, setEmailPenerima] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [catatan, setCatatan] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [tierMsg, setTierMsg] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const user = JSON.parse(raw);
    setEmailSaya(user.email);

    getDataTransfer(user.email).then((res) => {
      if (res.success) {
        setTransfers(res.transfers ?? []);
        setAwardMiles(res.award_miles ?? 0);
      }
      setLoading(false);
    });
  }, []);

  const openModal = () => {
    setEmailPenerima("");
    setJumlah("");
    setCatatan("");
    setFormError("");
    setSuccessMsg("");
    setTierMsg("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setFormError("");

    if (!emailPenerima || !jumlah) {
      setFormError("Email penerima dan jumlah miles wajib diisi.");
      return;
    }
    if (emailPenerima.toLowerCase() === emailSaya.toLowerCase()) {
      setFormError("Anda tidak dapat mentransfer miles ke diri sendiri.");
      return;
    }
    const jumlahNum = parseInt(jumlah, 10);
    if (isNaN(jumlahNum) || jumlahNum <= 0) {
      setFormError("Jumlah miles harus berupa angka positif.");
      return;
    }

    setFormLoading(true);
    const result = await transferMiles(emailSaya, emailPenerima, jumlahNum, catatan);
    setFormLoading(false);

    if (result.success) {
      const fresh = await getDataTransfer(emailSaya);
      if (fresh.success) {
        setTransfers(fresh.transfers ?? []);
        setAwardMiles(fresh.award_miles ?? 0);
      }
      setShowModal(false);
      setSuccessMsg(result.message ?? "Transfer berhasil.");
      setTimeout(() => setSuccessMsg(""), 4000);

      // Tampilkan pesan tier change dari trigger 4.2 kalau ada
      if (result.tier_message) {
        setTierMsg(result.tier_message);
        setTimeout(() => setTierMsg(""), 6000);
      }
    } else {
      setFormError(result.message ?? "Transfer gagal.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        Memuat data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Transfer Miles</h1>
            <p className="text-gray-500 text-sm mt-1">
              Award Miles tersedia:{" "}
              <span className="text-blue-600 font-semibold text-base">
                {formatMiles(awardMiles)}
              </span>
            </p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Transfer Baru
          </button>
        </div>

        {/* Pesan sukses transfer */}
        {successMsg && (
          <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
            {successMsg}
          </div>
        )}

        {/* Pesan tier change dari trigger 4.2 */}
        {tierMsg && (
          <div className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded-lg">
            🏆 {tierMsg}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-gray-700 font-semibold text-sm">Riwayat Transfer</h2>
          </div>

          {transfers.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Belum ada riwayat transfer.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transfers.map((t, idx) => {
                const isKirim = t.email_member_1.toLowerCase() === emailSaya.toLowerCase();
                const counterpartEmail = isKirim ? t.email_member_2 : t.email_member_1;
                const counterpartName = isKirim ? t.nama_penerima : t.nama_pengirim;

                return (
                  <div key={idx} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base ${
                        isKirim ? "bg-red-100 text-red-500" : "bg-emerald-100 text-emerald-500"
                      }`}>
                        {isKirim ? "↑" : "↓"}
                      </div>
                      <div>
                        <p className="text-gray-800 text-sm font-medium">{counterpartName}</p>
                        <p className="text-gray-500 text-xs">{counterpartEmail}</p>
                        {t.catatan && (
                          <p className="text-gray-400 text-xs italic mt-0.5">"{t.catatan}"</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className={`text-base font-semibold ${isKirim ? "text-red-500" : "text-emerald-500"}`}>
                        {isKirim ? "-" : "+"}{formatMiles(t.jumlah)} miles
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          isKirim
                            ? "bg-red-100 text-red-500 border border-red-200"
                            : "bg-emerald-100 text-emerald-500 border border-emerald-200"
                        }`}>
                          {isKirim ? "Kirim" : "Terima"}
                        </span>
                        <span className="text-gray-400 text-xs">{t.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-gray-400 text-xs mt-4 text-center">
          Transfer yang sudah dibuat tidak dapat diubah atau dihapus.
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200">
              <h2 className="text-gray-900 font-semibold text-base">Transfer Miles</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 text-lg">✕</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-gray-600 text-sm">Award Miles tersedia</span>
                <span className="text-blue-600 font-bold">{formatMiles(awardMiles)}</span>
              </div>

              <input
                type="email"
                placeholder="Email penerima"
                value={emailPenerima}
                onChange={(e) => setEmailPenerima(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="number"
                min={1}
                placeholder="Jumlah miles"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
              />
              <textarea
                rows={2}
                placeholder="Catatan (opsional)"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              />
              <p className="text-amber-600 text-xs">⚠ Transfer bersifat permanen dan tidak dapat dibatalkan.</p>
            </div>

            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={formLoading}
                className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {formLoading ? "Memproses..." : "Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
