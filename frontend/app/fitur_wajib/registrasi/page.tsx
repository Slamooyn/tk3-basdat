"use client";
import { useState } from "react";
import { registerUser } from "@/app/actions/auth";

export default function RegisterPage() {
  const [role, setRole] = useState<"member" | "staff">("member");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    salutation: "Mr.",
    first_mid_name: "",
    last_name: "",
    country_code: "+62",
    mobile_number: "",
    tanggal_lahir: "",
    kewarganegaraan: "Indonesia",
    kode_maskapai: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError(null);

    if (!form.email || !form.password || !form.first_mid_name || !form.last_name || !form.tanggal_lahir) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (role === "staff" && !form.kode_maskapai) {
      setError("Pilih maskapai untuk akun staff.");
      return;
    }

    setLoading(true);
    const result = await registerUser({ ...form, role });
    setLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="text-center w-full max-w-xl">
            <div className="w-16 h-16 mx-auto bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-white text-2xl">
              ✈
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md mt-6">
              <p className="text-green-600 font-semibold text-lg">Registrasi berhasil!</p>
              <p className="text-sm text-gray-500 mt-2">Silakan login dengan akun Anda.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex flex-1 items-center justify-center py-10">
        <div className="text-center w-full max-w-xl">
          <div className="w-16 h-16 mx-auto bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-white text-2xl">
            ✈
          </div>

          <h1 className="mt-4 text-2xl font-semibold">Daftar Akun Baru</h1>

          <div className="bg-white p-6 rounded-xl shadow-md text-left mt-6">
            <h2 className="font-semibold mb-1">Registrasi</h2>
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              <button
                onClick={() => setRole("member")}
                className={`flex-1 py-2 rounded-lg text-sm transition ${
                  role === "member" ? "bg-white shadow font-medium" : "text-gray-500"
                }`}
              >
                Member
              </button>
              <button
                onClick={() => setRole("staff")}
                className={`flex-1 py-2 rounded-lg text-sm transition ${
                  role === "staff" ? "bg-white shadow font-medium" : "text-gray-500"
                }`}
              >
                Staff
              </button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}
            <label className="text-sm">Sapaan *</label>
            <select
              name="salutation"
              value={form.salutation}
              onChange={handleChange}
              className="w-full mt-1 mb-3 px-3 py-2 border rounded-md"
            >
              <option>Mr.</option>
              <option>Mrs.</option>
              <option>Ms.</option>
              <option>Dr.</option>
            </select>
            <label className="text-sm">Email *</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full mt-1 mb-3 px-3 py-2 border rounded-md"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md"
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Konfirmasi Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md"
              />
            </div>

            <hr className="my-4" />
            <p className="text-sm font-semibold mb-2">Data Pribadi</p>

            <input
              name="first_mid_name"
              placeholder="Nama Depan"
              value={form.first_mid_name}
              onChange={handleChange}
              className="w-full mb-3 px-3 py-2 border rounded-md"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                name="last_name"
                placeholder="Nama Belakang"
                value={form.last_name}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md"
              />
              <select
                name="kewarganegaraan"
                value={form.kewarganegaraan}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md"
              >
                <option>Indonesia</option>
                <option>Singapura</option>
                <option>Malaysia</option>
                <option>Vietnam</option>
                <option>China</option>
                <option>Korea Selatan</option>
                <option>Jepang</option>
                <option>Australia</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <select
                name="country_code"
                value={form.country_code}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md"
              >
                <option value="+62">+62</option>
                <option value="+65">+65</option>
                <option value="+60">+60</option>
                <option value="+84">+84</option>
                <option value="+86">+86</option>
                <option value="+82">+82</option>
                <option value="+81">+81</option>
                <option value="+61">+61</option>
              </select>
              <input
                name="mobile_number"
                placeholder="Nomor HP"
                value={form.mobile_number}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md"
              />
            </div>

            <input
              name="tanggal_lahir"
              type="date"
              value={form.tanggal_lahir}
              onChange={handleChange}
              className="w-full mt-3 px-3 py-2 border rounded-md"
            />
            {role === "staff" && (
              <>
                <hr className="my-4" />
                <p className="text-sm font-semibold mb-2">Data Staf</p>
                <select
                  name="kode_maskapai"
                  value={form.kode_maskapai}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Pilih maskapai</option>
                  <option value="GA">Garuda Indonesia</option>
                  <option value="JT">Lion Air</option>
                  <option value="QZ">AirAsia Indonesia</option>
                  <option value="SJ">Sriwijaya Air</option>
                  <option value="ID">Batik Air</option>
                </select>
              </>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-6 bg-[var(--color-primary)] text-white py-2 rounded-md hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              {loading ? "Mendaftar..." : "Daftar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}