"use server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET semua klaim (untuk staf - semua klaim maskapainya)
export async function getKlaimByStaf(emailStaf: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
        c.id, c.email_member, c.maskapai, c.bandara_asal, c.bandara_tujuan,
        TO_CHAR(c.tanggal_penerbangan, 'YYYY-MM-DD') AS tanggal_penerbangan,
        c.flight_number, c.nomor_tiket, c.kelas_kabin, c.pnr,
        c.status_penerimaan,
        TO_CHAR(c.timestamp, 'YYYY-MM-DD HH24:MI') AS timestamp,
        p.first_mid_name || ' ' || p.last_name AS nama_member
       FROM claim_missing_miles c
       JOIN pengguna p ON LOWER(p.email) = LOWER(c.email_member)
       JOIN staf s ON LOWER(s.email) = LOWER($1)
       WHERE c.maskapai = s.kode_maskapai
       ORDER BY c.timestamp DESC`,
      [emailStaf]
    );
    return { success: true, data: result.rows };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// GET klaim milik member tertentu
export async function getKlaimByMember(emailMember: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
        c.id,
        c.maskapai,
        ba.nama AS bandara_asal_nama,
        bt.nama AS bandara_tujuan_nama,
        TO_CHAR(c.tanggal_penerbangan, 'YYYY-MM-DD') AS tanggal_penerbangan,
        c.flight_number, c.nomor_tiket, c.kelas_kabin, c.pnr,
        c.status_penerimaan,
        TO_CHAR(c.timestamp, 'YYYY-MM-DD HH24:MI') AS timestamp
       FROM claim_missing_miles c
       JOIN bandara ba ON ba.iata_code = c.bandara_asal
       JOIN bandara bt ON bt.iata_code = c.bandara_tujuan
       WHERE LOWER(c.email_member) = LOWER($1)
       ORDER BY c.timestamp DESC`,
      [emailMember]
    );
    return { success: true, data: result.rows };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// GET data untuk dropdown: bandara dan maskapai
export async function getDataFormKlaim() {
  const client = await pool.connect();
  try {
    const [bandaraRes, maskapaiRes] = await Promise.all([
      client.query(`SELECT iata_code, nama, kota FROM bandara ORDER BY nama ASC`),
      client.query(`SELECT kode_maskapai, nama_maskapai FROM maskapai ORDER BY nama_maskapai ASC`),
    ]);
    return {
      success: true,
      bandara: bandaraRes.rows,
      maskapai: maskapaiRes.rows,
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// POST ajukan klaim baru — trigger 4-1 otomatis cek duplikat di sini
export async function ajukanKlaim(form: {
  email_member: string;
  maskapai: string;
  bandara_asal: string;
  bandara_tujuan: string;
  tanggal_penerbangan: string;
  flight_number: string;
  nomor_tiket: string;
  kelas_kabin: string;
  pnr: string;
}) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO claim_missing_miles 
        (email_member, maskapai, bandara_asal, bandara_tujuan,
         tanggal_penerbangan, flight_number, nomor_tiket, kelas_kabin, pnr)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        form.email_member,
        form.maskapai,
        form.bandara_asal,
        form.bandara_tujuan,
        form.tanggal_penerbangan,
        form.flight_number,
        form.nomor_tiket,
        form.kelas_kabin,
        form.pnr,
      ]
    );
    return { success: true, message: "Klaim berhasil diajukan." };
  } catch (err: any) {
    // Pesan error dari trigger 4-1 langsung muncul di sini
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// PUT update status klaim oleh staf (Disetujui / Ditolak)
// Trigger 4-2 (update tier) otomatis jalan saat status → Disetujui
// karena trigger nomor 5 akan update total_miles, yang lalu memicu trigger 4-2
export async function updateStatusKlaim(
  id: number,
  emailStaf: string,
  status: "Disetujui" | "Ditolak"
) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE claim_missing_miles
       SET status_penerimaan = $1, email_staf = $2
       WHERE id = $3
       RETURNING id`,
      [status, emailStaf, id]
    );
    if (result.rows.length === 0) {
      return { success: false, message: "Klaim tidak ditemukan." };
    }
    return {
      success: true,
      message: `Klaim berhasil di${status === "Disetujui" ? "setujui" : "tolak"}.`,
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// GET data tier member (award_miles, total_miles, tier saat ini, semua tier)
export async function getInfoTier(emailMember: string) {
  const client = await pool.connect();
  try {
    const [memberRes, tierRes] = await Promise.all([
      client.query(
        `SELECT m.award_miles, m.total_miles, t.id_tier, t.nama AS nama_tier
         FROM member m
         JOIN tier t ON t.id_tier = m.id_tier
         WHERE LOWER(m.email) = LOWER($1)`,
        [emailMember]
      ),
      client.query(
        `SELECT id_tier, nama, minimal_frekuensi_terbang, minimal_tier_miles
         FROM tier
         ORDER BY minimal_tier_miles ASC`
      ),
    ]);

    if (memberRes.rows.length === 0) {
      return { success: false, message: "Member tidak ditemukan." };
    }

    return {
      success: true,
      member: memberRes.rows[0],
      tiers: tierRes.rows,
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}
