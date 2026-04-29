"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

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

    return (
        <nav className="bg-gradient-to-r from-[var(--color-navy-dark)] to-[var(--color-navy-mid)] text-white px-6 py-3">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">✈</span>
                        <span className="font-bold text-lg">AeroMiles</span>
                    </div>

                    {user && (
                        <>
                            <Link href="/fitur_wajib/dashboard">Dashboard</Link>
                            <Link href="/fitur_salman/manajemen_identitas_member">Identitas Saya</Link>
                            <Link href="/fitur_salman/manajemen_data_member">Kelola Member</Link>
                            <Link href="/fitur_wajib/kelola-klaim">Kelola Klaim</Link>
                            <Link href="/fitur_wajib/kelola-hadiah">Kelola Hadiah</Link>
                            <Link href="/fitur_wajib/kelola-mitra">Kelola Mitra</Link>
                            <Link href="/fitur_wajib/laporan-transaksi">Laporan Transaksi</Link>
                            <Link href="/fitur_wajib/profile">Pengaturan Profil</Link>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-sm opacity-80">
                                Masuk sebagai <b>{user.name}</b> - {user.role}
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
                                className="px-3 py-1 rounded bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition"
                            >
                                Login
                            </button>

                            <button
                                onClick={() => router.push("/fitur_wajib/registrasi")}
                                className="px-3 py-1 rounded bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition"
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