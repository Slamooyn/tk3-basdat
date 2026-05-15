"use client";

import { useEffect, useState } from "react";
import { getProfile, updateProfile, changePassword } from "@/app/actions/auth";
import { FiLock, FiX, FiEye, FiEyeOff } from "react-icons/fi";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      getProfile(parsed.email).then((res) => {
        if (res.success) {
          setProfile(res.data);
          setForm({
            salutation: res.data.salutation,
            first_mid_name: res.data.first_mid_name,
            last_name: res.data.last_name,
            kewarganegaraan: res.data.kewarganegaraan,
            country_code: res.data.country_code,
            mobile_number: res.data.mobile_number,
            tanggal_lahir: res.data.tanggal_lahir
              ? new Date(res.data.tanggal_lahir).toISOString().split("T")[0]
              : "",
            ...(res.data.kode_maskapai ? { kode_maskapai: res.data.kode_maskapai } : {}),
          });
        }
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    const result = await updateProfile(profile.email, form);
    setLoading(false);
    if (result.success) {
      setMessage({ type: "success", text: "Profil berhasil disimpan." });
    } else {
      setMessage({ type: "error", text: result.message ?? "Gagal menyimpan." });
    }
  };

  const openPwModal = () => {
    setPwForm({ old: "", new: "", confirm: "" });
    setPwMessage(null);
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
    setShowPwModal(true);
  };

  const handleChangePassword = async () => {
    setPwMessage(null);

    if (!pwForm.old || !pwForm.new || !pwForm.confirm) {
      setPwMessage({ type: "error", text: "Semua field wajib diisi." });
      return;
    }
    if (pwForm.new.length < 6) {
      setPwMessage({ type: "error", text: "Password baru minimal 6 karakter." });
      return;
    }
    if (pwForm.new !== pwForm.confirm) {
      setPwMessage({ type: "error", text: "Konfirmasi password tidak cocok." });
      return;
    }
    if (pwForm.old === pwForm.new) {
      setPwMessage({ type: "error", text: "Password baru tidak boleh sama dengan password lama." });
      return;
    }

    setPwLoading(true);
    const result = await changePassword(profile.email, pwForm.old, pwForm.new);
    setPwLoading(false);

    if (result.success) {
      setPwMessage({ type: "success", text: "Password berhasil diubah." });
      setTimeout(() => setShowPwModal(false), 1500);
    } else {
      setPwMessage({ type: "error", text: result.message ?? "Gagal mengubah password." });
    }
  };

  if (!user || !profile || !form) return null;

  const role = profile.id_staf ? "staff" : "member";

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold mb-4">Pengaturan Profil</h1>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Data Profil</h2>

          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-600"
                : "bg-red-50 border-red-200 text-red-600"
            }`}>
              {message.text}
            </div>
          )}

          {/* EMAIL */}
          <label className="text-sm">Email</label>
          <input
            value={profile.email}
            disabled
            className="w-full mt-1 mb-3 px-3 py-2 border rounded-md bg-gray-100"
          />

          {/* ROLE BASED FIELD */}
          {role === "member" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Nomor Member</label>
                <input
                  value={profile.nomor_member ?? "-"}
                  disabled
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm">Tanggal Bergabung</label>
                <input
                  value={profile.tanggal_bergabung ? new Date(profile.tanggal_bergabung).toISOString().split("T")[0] : "-"}
                  disabled
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm">ID Staf</label>
              <input
                value={profile.id_staf ?? "-"}
                disabled
                className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100"
              />
            </div>
          )}

          {/* SALUTATION */}
          <label className="text-sm mt-3 block">Salutation</label>
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

          {/* NAMA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Nama Depan</label>
              <input
                name="first_mid_name"
                value={form.first_mid_name}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-sm">Nama Belakang</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm">Kewarganegaraan</label>
              <select
                name="kewarganegaraan"
                value={form.kewarganegaraan}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
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
          </div>

          {/* CONTACT */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-sm">Country Code</label>
              <select
                name="country_code"
                value={form.country_code}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
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
            </div>
            <div>
              <label className="text-sm">Nomor HP</label>
              <input
                name="mobile_number"
                value={form.mobile_number}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          {/* BIRTH */}
          <div className="mt-3">
            <label className="text-sm">Tanggal Lahir</label>
            <input
              type="date"
              name="tanggal_lahir"
              value={form.tanggal_lahir}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          {/* STAFF EXTRA */}
          {role === "staff" && (
            <div className="mt-3">
              <label className="text-sm">Kode Maskapai</label>
              <select
                name="kode_maskapai"
                value={form.kode_maskapai ?? ""}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="GA">Garuda Indonesia</option>
                <option value="JT">Lion Air</option>
                <option value="QZ">AirAsia Indonesia</option>
                <option value="SJ">Sriwijaya Air</option>
                <option value="ID">Batik Air</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            <button
              onClick={openPwModal}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <FiLock className="text-sm" />
              Ubah Password
            </button>
          </div>
        </div>
      </div>

      {/* PASSWORD MODAL */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPwModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiLock className="text-gray-500" />
                Ubah Password
              </h3>
              <button
                onClick={() => setShowPwModal(false)}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <FiX className="text-gray-500 text-lg" />
              </button>
            </div>

            {pwMessage && (
              <div className={`mb-4 p-3 rounded-md text-sm border ${
                pwMessage.type === "success"
                  ? "bg-green-50 border-green-200 text-green-600"
                  : "bg-red-50 border-red-200 text-red-600"
              }`}>
                {pwMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Password Lama</label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    value={pwForm.old}
                    onChange={(e) => setPwForm({ ...pwForm, old: e.target.value })}
                    placeholder="Masukkan password lama"
                    className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOld ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Password Baru</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={pwForm.new}
                    onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Konfirmasi Password Baru</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    placeholder="Ulangi password baru"
                    className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPwModal(false)}
                className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleChangePassword}
                disabled={pwLoading}
                className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-colors"
              >
                {pwLoading ? "Menyimpan..." : "Simpan Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}