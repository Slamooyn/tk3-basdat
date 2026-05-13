"use client";

import { useState, useEffect } from "react";
import { getInfoTier } from "@/app/actions/klaim";

// Ambil email dari localStorage (sama seperti pola auth.ts di project ini)
function getEmailFromStorage(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored).email : "";
}

interface TierDB {
  id_tier: string;
  nama: string;
  minimal_frekuensi_terbang: number;
  minimal_tier_miles: number;
}

interface MemberTier {
  award_miles: number;
  total_miles: number;
  id_tier: string;
  nama_tier: string;
}

// Mapping warna per nama tier (karena data warna tidak ada di DB)
const tierStyle: Record<string, { warna: string; warnaText: string }> = {
  Blue:     { warna: "bg-blue-100 border-blue-300",     warnaText: "text-blue-700" },
  Silver:   { warna: "bg-gray-100 border-gray-300",     warnaText: "text-gray-600" },
  Gold:     { warna: "bg-yellow-50 border-yellow-400",  warnaText: "text-yellow-700" },
  Platinum: { warna: "bg-indigo-50 border-indigo-400",  warnaText: "text-indigo-700" },
};

// Keuntungan per tier (tidak ada di DB, hardcode boleh karena bukan data transaksi)
const tierKeuntungan: Record<string, string[]> = {
  Blue:     ["Akumulasi miles dasar", "Akses penawaran khusus member"],
  Silver:   ["Bonus miles 25%", "Priority check-in", "Akses lounge partner"],
  Gold:     ["Bonus miles 50%", "Priority boarding", "Akses lounge premium", "Extra bagasi 10kg"],
  Platinum: ["Bonus miles 100%", "Upgrade gratis (subject to availability)", "Akses lounge first class", "Extra bagasi 20kg", "Dedicated hotline"],
};

export default function InfoTier() {
  const [email] = useState<string>(getEmailFromStorage);
  const [member, setMember] = useState<MemberTier | null>(null);
  const [tiers, setTiers] = useState<TierDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!email) return;
    getInfoTier(email).then((res) => {
      if (res.success && res.member && res.tiers) {
        setMember(res.member);
        setTiers(res.tiers);
      } else {
        setErrorMsg(res.message ?? "Gagal memuat data tier.");
      }
      setLoading(false);
    });
  }, [email]);

  if (loading) return <div className="p-8 text-gray-400">Memuat data...</div>;
  if (errorMsg) return <div className="p-8 text-red-500">{errorMsg}</div>;
  if (!member) return null;

  const indexSaatIni = tiers.findIndex((t) => t.id_tier === member.id_tier);
  const tierBerikutnya = tiers[indexSaatIni + 1] ?? null;

  const milesProgress = tierBerikutnya
    ? Math.min((member.total_miles / tierBerikutnya.minimal_tier_miles) * 100, 100)
    : 100;

  const milesKurang = tierBerikutnya
    ? Math.max(tierBerikutnya.minimal_tier_miles - member.total_miles, 0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Info Tier</h1>

        {/* Progress bar ke tier berikutnya */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          {tierBerikutnya ? (
            <>
              <p className="text-sm text-gray-500 mb-1">
                Progress ke Tier Berikutnya:{" "}
                <span className="font-semibold text-gray-700">{tierBerikutnya.nama}</span>
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Total Miles</span>
                <span>
                  {member.total_miles.toLocaleString("id-ID")} /{" "}
                  {tierBerikutnya.minimal_tier_miles.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${milesProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Butuh{" "}
                <span className="font-semibold text-gray-600">
                  {milesKurang.toLocaleString("id-ID")}
                </span>{" "}
                miles lagi untuk naik ke tier {tierBerikutnya.nama}
              </p>
            </>
          ) : (
            <p className="text-sm font-semibold text-indigo-600">
              🏆 Selamat! Anda sudah berada di tier tertinggi (Platinum).
            </p>
          )}
        </div>

        {/* Daftar semua tier */}
        <div className="space-y-4">
          {tiers.map((tier) => {
            const isAktif = tier.id_tier === member.id_tier;
            const style = tierStyle[tier.nama] ?? { warna: "bg-white border-gray-200", warnaText: "text-gray-700" };
            const keuntungan = tierKeuntungan[tier.nama] ?? [];

            return (
              <div
                key={tier.id_tier}
                className={`rounded-xl border-2 p-5 transition-all ${
                  isAktif ? style.warna + " shadow-md" : "bg-white border-gray-200 opacity-80"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${
                      isAktif ? "border-current" : "border-gray-300 text-gray-400"
                    } ${style.warnaText}`}
                  >
                    👑
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-base ${isAktif ? style.warnaText : "text-gray-700"}`}>
                        {tier.nama}
                      </span>
                      {isAktif && (
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          Tier Anda
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Min. {tier.minimal_frekuensi_terbang} penerbangan · Min.{" "}
                      {tier.minimal_tier_miles.toLocaleString("id-ID")} miles
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Keuntungan:</p>
                  <ul className="space-y-1">
                    {keuntungan.map((k, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-500 text-base">✓</span>
                        {k}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
