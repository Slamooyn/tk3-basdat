"use server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getIdentitasByMember(email: string): Promise<{ success: true; data: any[] } | { success: false; message: string }> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT nomor, jenis, negara_penerbit, tanggal_terbit, tanggal_habis
       FROM identitas
       WHERE LOWER(email_member) = LOWER($1)
       ORDER BY tanggal_habis DESC`,
      [email]
    );
    return { success: true, data: result.rows };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

export async function addIdentitas(data: {
  email_member: string;
  nomor: string;
  jenis: string;
  negara_penerbit: string;
  tanggal_terbit: string;
  tanggal_habis: string;
}): Promise<{ success: true } | { success: false; message: string }> {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO identitas (nomor, email_member, tanggal_habis, tanggal_terbit, negara_penerbit, jenis)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [data.nomor, data.email_member, data.tanggal_habis, data.tanggal_terbit, data.negara_penerbit, data.jenis]
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

export async function updateIdentitas(
  nomor: string,
  data: {
    jenis: string;
    negara_penerbit: string;
    tanggal_terbit: string;
    tanggal_habis: string;
  }
): Promise<{ success: true } | { success: false; message: string }> {
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE identitas SET
        jenis = $1,
        negara_penerbit = $2,
        tanggal_terbit = $3,
        tanggal_habis = $4
       WHERE nomor = $5`,
      [data.jenis, data.negara_penerbit, data.tanggal_terbit, data.tanggal_habis, nomor]
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

export async function deleteIdentitas(
  nomor: string
): Promise<{ success: true } | { success: false; message: string }> {
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM identitas WHERE nomor = $1`, [nomor]);
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}