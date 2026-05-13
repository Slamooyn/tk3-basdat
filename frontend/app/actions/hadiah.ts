"use server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET semua hadiah beserta nama penyedia
export async function getHadiah() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        h.kode_hadiah,
        h.nama,
        h.miles,
        h.deskripsi,
        TO_CHAR(h.valid_start_date, 'YYYY-MM-DD') AS valid_start_date,
        TO_CHAR(h.program_end, 'YYYY-MM-DD') AS program_end,
        h.id_penyedia,
        COALESCE(mk.nama_maskapai, mt.nama_mitra) AS nama_penyedia
      FROM hadiah h
      LEFT JOIN maskapai mk ON mk.id_penyedia = h.id_penyedia
      LEFT JOIN mitra mt ON mt.id_penyedia = h.id_penyedia
      ORDER BY h.kode_hadiah ASC
    `);
    return { success: true, data: result.rows };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// GET semua penyedia (maskapai + mitra) untuk dropdown
export async function getPenyedia() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        p.id,
        COALESCE(mk.nama_maskapai, mt.nama_mitra) AS nama
      FROM penyedia p
      LEFT JOIN maskapai mk ON mk.id_penyedia = p.id
      LEFT JOIN mitra mt ON mt.id_penyedia = p.id
      ORDER BY p.id ASC
    `);
    return { success: true, data: result.rows };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// POST tambah hadiah baru (kode auto-generate dari sequence database)
export async function tambahHadiah(form: {
  nama: string;
  miles: number;
  deskripsi: string;
  valid_start_date: string;
  program_end: string;
  id_penyedia: number;
}) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO hadiah (nama, miles, deskripsi, valid_start_date, program_end, id_penyedia)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING kode_hadiah
    `, [
      form.nama,
      form.miles,
      form.deskripsi,
      form.valid_start_date,
      form.program_end,
      form.id_penyedia
    ]);

    return { 
      success: true, 
      message: "Hadiah berhasil ditambahkan!",
      kode: result.rows[0].kode_hadiah 
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// PUT update hadiah (kode_hadiah tidak bisa diubah)
export async function updateHadiah(
  kode_hadiah: string,
  form: {
    nama: string;
    miles: number;
    deskripsi: string;
    valid_start_date: string;
    program_end: string;
    id_penyedia: number;
  }
) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      UPDATE hadiah
      SET 
        nama = $1,
        miles = $2,
        deskripsi = $3,
        valid_start_date = $4,
        program_end = $5,
        id_penyedia = $6
      WHERE kode_hadiah = $7
      RETURNING kode_hadiah
    `, [
      form.nama,
      form.miles,
      form.deskripsi,
      form.valid_start_date,
      form.program_end,
      form.id_penyedia,
      kode_hadiah
    ]);

    if (result.rows.length === 0) {
      return { success: false, message: "Hadiah tidak ditemukan!" };
    }

    return { success: true, message: "Hadiah berhasil diupdate!" };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// DELETE hapus hadiah (hanya jika program_end sudah lewat / tidak aktif)
export async function hapusHadiah(kode_hadiah: string) {
  const client = await pool.connect();
  try {
    const today = new Date().toISOString().split("T")[0];

    // Cek apakah hadiah ada dan sudah tidak aktif
    const cek = await client.query(`
      SELECT program_end FROM hadiah WHERE kode_hadiah = $1
    `, [kode_hadiah]);

    if (cek.rows.length === 0) {
      return { success: false, message: "Hadiah tidak ditemukan!" };
    }

    const programEnd = cek.rows[0].program_end.toISOString().split("T")[0];
    if (programEnd >= today) {
      return { 
        success: false, 
        message: "Hadiah masih aktif, tidak dapat dihapus!" 
      };
    }

    await client.query(`
      DELETE FROM hadiah WHERE kode_hadiah = $1
    `, [kode_hadiah]);

    return { success: true, message: "Hadiah berhasil dihapus!" };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// GET top 5 member berdasarkan total miles (stored procedure)
export async function getTop5Member() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM get_top5_member_by_total_miles()
    `);
    
    // Generate pesan sesuai format soal
    const top1 = result.rows[0];
    const pesan = `SUKSES: Daftar Top 5 Member berdasarkan total miles berhasil diperbarui, dengan peringkat pertama "${top1.email}" memiliki ${top1.total_miles} miles.`;

    return { success: true, data: result.rows, pesan };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}