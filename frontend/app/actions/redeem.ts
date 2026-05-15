"use server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getDataRedeem(emailMember: string) {
  const client = await pool.connect();
  try {
    const [memberRes, hadiahRes, riwayatRes] = await Promise.all([
      client.query(
        `SELECT award_miles FROM member WHERE LOWER(email) = LOWER($1)`,
        [emailMember]
      ),
      client.query(
        `SELECT h.kode_hadiah, h.nama, h.miles, h.deskripsi,
                TO_CHAR(h.valid_start_date, 'YYYY-MM-DD') AS valid_start_date,
                TO_CHAR(h.program_end, 'YYYY-MM-DD') AS program_end,
                COALESCE(mk.nama_maskapai, mt.nama_mitra) AS penyedia
         FROM hadiah h
         LEFT JOIN maskapai mk ON mk.id_penyedia = h.id_penyedia
         LEFT JOIN mitra mt ON mt.id_penyedia = h.id_penyedia
         ORDER BY h.miles ASC`
      ),
      client.query(
        `SELECT h.nama AS hadiah, h.miles,
                TO_CHAR(r.timestamp, 'YYYY-MM-DD HH24:MI') AS waktu
         FROM redeem r
         JOIN hadiah h ON h.kode_hadiah = r.kode_hadiah
         WHERE LOWER(r.email_member) = LOWER($1)
         ORDER BY r.timestamp DESC`,
        [emailMember]
      ),
    ]);

    return {
      success: true,
      award_miles: memberRes.rows[0]?.award_miles ?? 0,
      hadiah: hadiahRes.rows,
      riwayat: riwayatRes.rows,
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

export async function redeemHadiah(emailMember: string, kodeHadiah: string) {
  const client = await pool.connect();

  // Tangkap RAISE NOTICE dari trigger 3.1 (redeem berhasil)
  const notices: string[] = [];
  client.on("notice", (msg) => {
    if (msg.message) notices.push(msg.message);
  });

  try {
    await client.query(
      `INSERT INTO redeem (email_member, kode_hadiah, timestamp)
       VALUES ($1, $2, NOW())`,
      [emailMember, kodeHadiah]
    );

    // Ambil award_miles terbaru setelah trigger 3.1 kurangi
    const updated = await client.query(
      `SELECT award_miles FROM member WHERE LOWER(email) = LOWER($1)`,
      [emailMember]
    );

    // Ambil pesan sukses dari trigger 3.1
    const pesanRedeem = notices.find((n) => n.startsWith("SUKSES: Redeem"))
      ?? `SUKSES: Redeem hadiah berhasil.`;

    return {
      success: true,
      message: pesanRedeem,
      award_miles: updated.rows[0].award_miles,
    };
  } catch (err: any) {
    // Pesan error dari trigger 3.1 (saldo tidak cukup / periode tidak aktif)
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}