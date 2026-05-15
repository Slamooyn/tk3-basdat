"use server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET riwayat transfer dan award_miles member
export async function getDataTransfer(emailMember: string) {
  const client = await pool.connect();
  try {
    const [transferRes, memberRes] = await Promise.all([
      client.query(
        `SELECT
          t.email_member_1,
          t.email_member_2,
          p1.first_mid_name || ' ' || p1.last_name AS nama_pengirim,
          p2.first_mid_name || ' ' || p2.last_name AS nama_penerima,
          t.jumlah,
          t.catatan,
          TO_CHAR(t.timestamp, 'YYYY-MM-DD HH24:MI') AS timestamp
         FROM transfer t
         JOIN pengguna p1 ON LOWER(p1.email) = LOWER(t.email_member_1)
         JOIN pengguna p2 ON LOWER(p2.email) = LOWER(t.email_member_2)
         WHERE LOWER(t.email_member_1) = LOWER($1)
            OR LOWER(t.email_member_2) = LOWER($1)
         ORDER BY t.timestamp DESC`,
        [emailMember]
      ),
      client.query(
        `SELECT award_miles FROM member WHERE LOWER(email) = LOWER($1)`,
        [emailMember]
      ),
    ]);

    return {
      success: true,
      transfers: transferRes.rows,
      award_miles: memberRes.rows[0]?.award_miles ?? 0,
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// POST transfer miles — trigger 2 otomatis cek saldo dan catat log
export async function transferMiles(
  emailPengirim: string,
  emailPenerima: string,
  jumlah: number,
  catatan: string
) {
  const client = await pool.connect();
  const notices: string[] = [];

  // Tangkap pesan RAISE NOTICE dari trigger 2
  client.on("notice", (msg) => {
    if (msg.message) notices.push(msg.message);
  });

  try {
    // Cek apakah penerima terdaftar sebagai member
    const penerimaRes = await client.query(
      `SELECT email FROM member WHERE LOWER(email) = LOWER($1)`,
      [emailPenerima]
    );
    if (penerimaRes.rows.length === 0) {
      return {
        success: false,
        message: "Email penerima tidak ditemukan sebagai Member aktif dalam sistem.",
      };
    }

    // INSERT ke tabel transfer — trigger 2 akan:
    // - cek saldo pengirim (2-1), kalau kurang → RAISE EXCEPTION
    // - catat log dan update award_miles (2-2) → RAISE NOTICE sukses
    await client.query(
      `INSERT INTO transfer (email_member_1, email_member_2, timestamp, jumlah, catatan)
       VALUES ($1, $2, NOW(), $3, $4)`,
      [emailPengirim, emailPenerima, jumlah, catatan]
    );

    // Ambil award_miles terbaru setelah transfer
    const updated = await client.query(
      `SELECT award_miles FROM member WHERE LOWER(email) = LOWER($1)`,
      [emailPengirim]
    );

    return {
      success: true,
      message: notices.join(" | ") || `SUKSES: Transfer ${jumlah} miles berhasil.`,
      award_miles: updated.rows[0].award_miles,
    };
  } catch (err: any) {
    // Pesan error dari trigger 2-1 (saldo tidak cukup) muncul di sini
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}