"use server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET semua mitra
export async function getMitra() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        email_mitra, 
        id_penyedia, 
        nama_mitra,
        TO_CHAR(tanggal_kerja_sama, 'YYYY-MM-DD') AS tanggal_kerja_sama
      FROM mitra
      ORDER BY tanggal_kerja_sama DESC
    `);
    return { success: true, data: result.rows };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// POST tambah mitra baru
// Otomatis buat entri PENYEDIA baru terlebih dahulu
export async function tambahMitra(form: {
  email_mitra: string;
  nama_mitra: string;
  tanggal_kerja_sama: string;
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Reset sequence ke nilai max id yang ada
    await client.query(`
      SELECT setval('penyedia_id_seq', (SELECT MAX(id) FROM penyedia))
    `);

    // Insert ke penyedia
    const penyediaResult = await client.query(`
      INSERT INTO penyedia DEFAULT VALUES
      RETURNING id
    `);
    const id_penyedia = penyediaResult.rows[0].id;

    // Insert ke mitra
    await client.query(`
      INSERT INTO mitra (email_mitra, id_penyedia, nama_mitra, tanggal_kerja_sama)
      VALUES ($1, $2, $3, $4)
    `, [form.email_mitra, id_penyedia, form.nama_mitra, form.tanggal_kerja_sama]);

    await client.query("COMMIT");
    return { success: true, message: "Mitra berhasil ditambahkan!" };
  } catch (err: any) {
    await client.query("ROLLBACK");
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// PUT update mitra (email_mitra & id_penyedia tidak bisa diubah)
export async function updateMitra(
  email_mitra: string,
  form: {
    nama_mitra: string;
    tanggal_kerja_sama: string;
  }
) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      UPDATE mitra
      SET nama_mitra = $1, tanggal_kerja_sama = $2
      WHERE email_mitra = $3
      RETURNING email_mitra
    `, [form.nama_mitra, form.tanggal_kerja_sama, email_mitra]);

    if (result.rows.length === 0) {
      return { success: false, message: "Mitra tidak ditemukan!" };
    }

    return { success: true, message: "Mitra berhasil diupdate!" };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// DELETE hapus mitra
// Hadiah terkait otomatis terhapus karena ON DELETE CASCADE di schema
export async function hapusMitra(email_mitra: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      DELETE FROM mitra WHERE email_mitra = $1
      RETURNING email_mitra
    `, [email_mitra]);

    if (result.rows.length === 0) {
      return { success: false, message: "Mitra tidak ditemukan!" };
    }

    return { success: true, message: "Mitra berhasil dihapus!" };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}