"use client";

const dummyMember = {
  email: "john@example.com",
  nama: "Mr. John William Doe",
  id_tier: "TIER-GOLD",
  totalMiles: 45000,
};

interface Tier {
  id_tier: string;
  nama: string;
  minimal_frekuensi_terbang: number;
  minimal_tier_miles: number;
  keuntungan: string[];
  warna: string;
  warnaText: string;
}

const dummyTiers: Tier[] = [
  {
    id_tier: "TIER-BLUE",
    nama: "Blue",
    minimal_frekuensi_terbang: 0,
    minimal_tier_miles: 0,
    keuntungan: ["Akumulasi miles dasar", "Akses penawaran khusus member"],
    warna: "bg-blue-100 border-blue-300",
    warnaText: "text-blue-700",
  },
  {
    id_tier: "TIER-SILVER",
    nama: "Silver",
    minimal_frekuensi_terbang: 10,
    minimal_tier_miles: 15000,
    keuntungan: ["Bonus miles 25%", "Priority check-in", "Akses lounge partner"],
    warna: "bg-gray-100 border-gray-300",
    warnaText: "text-gray-600",
  },
  {
    id_tier: "TIER-GOLD",
    nama: "Gold",
    minimal_frekuensi_terbang: 25,
    minimal_tier_miles: 40000,
    keuntungan: [
      "Bonus miles 50%",
      "Priority boarding",
      "Akses lounge premium",
      "Extra bagasi 10kg",
    ],
    warna: "bg-yellow-50 border-yellow-400",
    warnaText: "text-yellow-700",
  },
  {
    id_tier: "TIER-PLATINUM",
    nama: "Platinum",
    minimal_frekuensi_terbang: 50,
    minimal_tier_miles: 80000,
    keuntungan: [
      "Bonus miles 100%",
      "Upgrade gratis (subject to availability)",
      "Akses lounge first class",
      "Extra bagasi 20kg",
      "Dedicated hotline",
    ],
    warna: "bg-indigo-50 border-indigo-400",
    warnaText: "text-indigo-700",
  },
];

export default function InfoTier() {
  const tierSaatIni = dummyTiers.find((t) => t.id_tier === dummyMember.id_tier)!;
  const indexSaatIni = dummyTiers.findIndex((t) => t.id_tier === dummyMember.id_tier);
  const tierBerikutnya = dummyTiers[indexSaatIni + 1] ?? null;

  const milesProgress = tierBerikutnya
    ? Math.min(
        (dummyMember.totalMiles / tierBerikutnya.minimal_tier_miles) * 100,
        100
      )
    : 100;

  const milesKurang = tierBerikutnya
    ? Math.max(tierBerikutnya.minimal_tier_miles - dummyMember.totalMiles, 0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#0f1b35] text-white px-6 py-3 flex items-center gap-6 text-sm flex-wrap">
        <span className="font-bold text-base tracking-wide mr-2">✈ AeroMiles</span>
        <span className="text-gray-400 text-xs border-r border-gray-600 pr-4">Dashboard</span>
        {["Identitas Saya", "Klaim Miles", "Transfer Miles", "Redeem Hadiah", "Beli Package"].map(
          (item) => (
            <a key={item} href="#" className="text-gray-300 hover:text-white transition-colors">
              {item}
            </a>
          )
        )}
        <a href="#" className="text-white font-semibold border-b border-white pb-0.5">
          Info Tier
        </a>
        <a href="#" className="text-gray-300 hover:text-white transition-colors">
          Pengaturan Profil
        </a>
        <a href="#" className="ml-auto text-red-400 hover:text-red-300 transition-colors">
          ⎋ Logout
        </a>
      </nav>
      <div className="bg-[#0f1b35] text-gray-400 text-xs px-6 pb-2">
        Masuk sebagai{" "}
        <span className="text-blue-400 font-medium">{dummyMember.nama}</span> · Member
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Info Tier</h1>

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
                  {dummyMember.totalMiles.toLocaleString("id-ID")} /{" "}
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

        <div className="space-y-4">
          {dummyTiers.map((tier) => {
            const isAktif = tier.id_tier === dummyMember.id_tier;
            return (
              <div
                key={tier.id_tier}
                className={`rounded-xl border-2 p-5 transition-all ${
                  isAktif
                    ? tier.warna + " shadow-md"
                    : "bg-white border-gray-200 opacity-80"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${
                      isAktif ? "border-current" : "border-gray-300 text-gray-400"
                    } ${tier.warnaText}`}
                  >
                    👑
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-base ${
                          isAktif ? tier.warnaText : "text-gray-700"
                        }`}
                      >
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
                    {tier.keuntungan.map((k, i) => (
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
