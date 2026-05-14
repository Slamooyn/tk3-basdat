"use server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getDataLaporan() {
  const client = await pool.connect();
  try {
    const [transaksiRes, top5Res, totalRes] = await Promise.all([
      client.query(
        `(SELECT 
            'Transfer' AS tipe,
            t.email_member_1 AS email,
            p.first_mid_name || ' ' || p.last_name AS nama_member,
            -t.jumlah AS miles,
            TO_CHAR(t.timestamp, 'YYYY-MM-DD HH24:MI') AS waktu
          FROM transfer t
          JOIN pengguna p ON LOWER(p.email) = LOWER(t.email_member_1))
         UNION ALL
         (SELECT
            'Redeem' AS tipe,
            r.email_member AS email,
            p.first_mid_name || ' ' || p.last_name AS nama_member,
            -h.miles AS miles,
            TO_CHAR(r.timestamp, 'YYYY-MM-DD HH24:MI') AS waktu
          FROM redeem r
          JOIN hadiah h ON h.kode_hadiah = r.kode_hadiah
          JOIN pengguna p ON LOWER(p.email) = LOWER(r.email_member))
         UNION ALL
         (SELECT
            'Package' AS tipe,
            mamp.email_member AS email,
            p.first_mid_name || ' ' || p.last_name AS nama_member,
            amp.jumlah_award_miles AS miles,
            TO_CHAR(mamp.timestamp, 'YYYY-MM-DD HH24:MI') AS waktu
          FROM member_award_miles_package mamp
          JOIN award_miles_package amp ON amp.id = mamp.id_award_miles_package
          JOIN pengguna p ON LOWER(p.email) = LOWER(mamp.email_member))
         UNION ALL
         (SELECT
            'Klaim' AS tipe,
            c.email_member AS email,
            p.first_mid_name || ' ' || p.last_name AS nama_member,
            CASE WHEN c.status_penerimaan = 'Disetujui' THEN 1000 ELSE 0 END AS miles,
            TO_CHAR(c.timestamp, 'YYYY-MM-DD HH24:MI') AS waktu
          FROM claim_missing_miles c
          JOIN pengguna p ON LOWER(p.email) = LOWER(c.email_member))
         ORDER BY waktu DESC`
      ),
      // Panggil stored procedure trigger 5.2 dari teman
      client.query(
        `SELECT rank, email, total_miles FROM get_top5_member_by_total_miles()`
      ),
      client.query(
        `SELECT COALESCE(SUM(total_miles), 0) AS total FROM member`
      ),
    ]);

    return {
      success: true,
      transaksi: transaksiRes.rows,
      top5: top5Res.rows,
      total_miles_beredar: totalRes.rows[0].total,
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}
