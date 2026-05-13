"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getDashboardData } from "@/app/actions/auth";
import {
    FiHome,
    FiUser,
    FiFileText,
    FiRepeat,
    FiGift,
    FiShoppingCart,
    FiInfo,
    FiSettings,
    FiUsers,
    FiClipboard,
    FiDatabase,
    FiBarChart2,
} from "react-icons/fi";

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();
    const [namaLengkap, setNamaLengkap] = useState<string>(""); // ← tambah ini

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
        else setUser(null);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        router.push("/fitur_wajib/login");
    };
    const linkClass = (path: string) =>
        `flex items-center gap-1 relative group ${pathname === path ? "text-white font-medium" : "text-white/80"
        }`;

    const underline = (path: string) => (
        <span
            className={`absolute left-0 -bottom-1 h-[2px] bg-white transition-all duration-300 ${pathname === path ? "w-full" : "w-0 group-hover:w-full"
                }`}
        />
    );
     useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            getDashboardData(parsed.email, parsed.role).then((res) => {
                if (res.success && res.data) {
                    const nama = `${res.data.first_mid_name ?? ""} ${res.data.last_name ?? ""}`.trim();
                    setNamaLengkap(nama);
                }
            });
        } else {
            setUser(null);
            setNamaLengkap("");
        }
    }, [pathname]);

    return (
        <nav className="bg-gradient-to-r from-[var(--color-navy-dark)] to-[var(--color-navy-mid)] text-white px-6 py-3">
            <div className="flex justify-between items-center">

                {/* LEFT */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">✈</span>
                        <span className="font-bold text-lg">AeroMiles</span>
                    </div>

                    {user?.role === "member" && (
                        <>
                            <Link href="/fitur_wajib/dashboard" className={linkClass("/fitur_wajib/dashboard")}>
                                <FiHome size={14} />
                                Dashboard
                                {underline("/fitur_wajib/dashboard")}
                            </Link>

                            <Link href="/fitur_salman/manajemen_identitas_member" className={linkClass("/fitur_salman/manajemen_identitas_member")}>
                                <FiUser size={14} />
                                Identitas Saya
                                {underline("/fitur_salman/manajemen_identitas_member")}
                            </Link>

                            <Link href="/fitur_abhirama/claim-member" className={linkClass("/fitur_abhirama/claim-member")}>
                                <FiFileText size={14} />
                                Klaim Miles
                                {underline("/fitur_abhirama/claim-member")}
                            </Link>

                            <Link href="/fitur_abhirama/transfer-member" className={linkClass("/fitur_abhirama/transfer-member")}>
                                <FiRepeat size={14} />
                                Transfer Miles
                                {underline("/fitur_abhirama/transfer-member")}
                            </Link>

                            <Link href="/fitur_cello/fitur_redeem" className={linkClass("/fitur_cello/fitur_redeem")}>
                                <FiGift size={14} />
                                Redeem Hadiah
                                {underline("/fitur_cello/fitur_redeem")}
                            </Link>

                            <Link href="/fitur_cello/fitur_beli_miles" className={linkClass("/fitur_cello/fitur_beli_miles")}>
                                <FiShoppingCart size={14} />
                                Beli Package
                                {underline("/fitur_cello/fitur_beli_miles")}
                            </Link>

                            <Link href="/fitur_cello/fitur_informasi_tier" className={linkClass("/fitur_cello/fitur_informasi_tier")}>
                                <FiInfo size={14} />
                                Info Tier
                                {underline("/fitur_cello/fitur_informasi_tier")}
                            </Link>

                            <Link href="/fitur_wajib/profile" className={linkClass("/fitur_wajib/profile")}>
                                <FiSettings size={14} />
                                Pengaturan Profil
                                {underline("/fitur_wajib/profile")}
                            </Link>
                        </>
                    )}

                    {user?.role === "staff" && (
                        <>
                            <Link href="/fitur_wajib/dashboard" className={linkClass("/fitur_wajib/dashboard")}>
                                <FiHome size={14} />
                                Dashboard
                                {underline("/fitur_wajib/dashboard")}
                            </Link>

                            <Link href="/fitur_salman/manajemen_data_member" className={linkClass("/fitur_salman/manajemen_data_member")}>
                                <FiUsers size={14} />
                                Kelola Member
                                {underline("/fitur_salman/manajemen_data_member")}
                            </Link>

                            <Link href="/fitur_abhirama/claim-staff" className={linkClass("/fitur_abhirama/claim-staff")}>
                                <FiClipboard size={14} />
                                Kelola Klaim
                                {underline("/fitur_abhirama/claim-staff")}
                            </Link>

                            <Link href="/fitur_hafizh/kelola-hadiah" className={linkClass("/fitur_hafizh/kelola-hadiah")}>
                                <FiGift size={14} />
                                Kelola Hadiah
                                {underline("/fitur_hafizh/kelola-hadiah")}
                            </Link>

                            <Link href="/fitur_hafizh/kelola-mitra" className={linkClass("/fitur_hafizh/kelola-mitra")}>
                                <FiDatabase size={14} />
                                Kelola Mitra
                                {underline("/fitur_hafizh/kelola-mitra")}
                            </Link>

                            <Link href="/fitur_cello/fitur_laporan" className={linkClass("/fitur_cello/fitur_laporan")}>
                                <FiBarChart2 size={14} />
                                Laporan Transaksi
                                {underline("/fitur_cello/fitur_laporan")}
                            </Link>

                            <Link href="/fitur_wajib/profile" className={linkClass("/fitur_wajib/profile")}>
                                <FiSettings size={14} />
                                Pengaturan Profil
                                {underline("/fitur_wajib/profile")}
                            </Link>
                        </>
                    )}
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-sm opacity-80">
                                Masuk sebagai <b>{namaLengkap || user.name}</b> - {user.role}
                            </span>

                            <button
                                onClick={handleLogout}
                                className="text-red-400 hover:text-red-300"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => router.push("/fitur_wajib/login")}
                                className="px-3 py-1 rounded bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                            >
                                Login
                            </button>

                            <button
                                onClick={() => router.push("/fitur_wajib/registrasi")}
                                className="px-3 py-1 rounded bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                            >
                                Registrasi
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}