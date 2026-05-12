"use server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function registerUser(formData: {
  email: string;
  password: string;
  salutation: string;
  first_mid_name: string;
  last_name: string;
  country_code: string;
  mobile_number: string;
  tanggal_lahir: string;
  kewarganegaraan: string;
  role: "member" | "staff";
  kode_maskapai?: string;
}) {
  const client = await pool.connect();
  try {
    const hashedPassword = await bcrypt.hash(formData.password, 12);

    await client.query("BEGIN");

    await client.query(
      `INSERT INTO pengguna 
        (email, password, salutation, first_mid_name, last_name, country_code, mobile_number, tanggal_lahir, kewarganegaraan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        formData.email,
        hashedPassword,
        formData.salutation,
        formData.first_mid_name,
        formData.last_name,
        formData.country_code,
        formData.mobile_number,
        formData.tanggal_lahir,
        formData.kewarganegaraan,
      ]
    );

    if (formData.role === "member") {
      await client.query(
        `INSERT INTO member (email, tanggal_bergabung, id_tier, award_miles, total_miles)
         VALUES ($1, CURRENT_DATE, 'TIER-BLU', 0, 0)`,
        [formData.email]
      );
    } else if (formData.role === "staff" && formData.kode_maskapai) {
      await client.query(
        `INSERT INTO staf (email, kode_maskapai) VALUES ($1, $2)`,
        [formData.email, formData.kode_maskapai]
      );
    }

    await client.query("COMMIT");
    return { success: true };
  } catch (err: any) {
    await client.query("ROLLBACK");
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}
export async function getProfile(email: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
        p.email, p.salutation, p.first_mid_name, p.last_name,
        p.country_code, p.mobile_number, p.tanggal_lahir, p.kewarganegaraan,
        m.nomor_member, m.tanggal_bergabung,
        s.id_staf, s.kode_maskapai
       FROM pengguna p
       LEFT JOIN member m ON LOWER(m.email) = LOWER(p.email)
       LEFT JOIN staf s ON LOWER(s.email) = LOWER(p.email)
       WHERE LOWER(p.email) = LOWER($1)`,
      [email]
    );

    if (result.rows.length === 0) {
      return { success: false, message: "User tidak ditemukan." };
    }

    return { success: true, data: result.rows[0] };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}
export async function loginUser(formData: {
  email: string;
  password: string;
}) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
        p.email, p.password, p.salutation, p.first_mid_name, p.last_name,
        EXISTS(SELECT 1 FROM member m WHERE LOWER(m.email) = LOWER(p.email)) AS is_member,
        EXISTS(SELECT 1 FROM staf s WHERE LOWER(s.email) = LOWER(p.email)) AS is_staf
       FROM pengguna p
       WHERE LOWER(p.email) = LOWER($1)`,
      [formData.email]
    );

    if (result.rows.length === 0) {
      return { success: false, message: "Email atau password salah, silakan coba lagi." };
    }

    const user = result.rows[0];

    const isValid = await bcrypt.compare(formData.password, user.password);
    if (!isValid) {
      return { success: false, message: "Email atau password salah, silakan coba lagi." };
    }

    return {
      success: true,
      user: {
        email: user.email,
        salutation: user.salutation,
        first_mid_name: user.first_mid_name,
        last_name: user.last_name,
        role: user.is_staf ? "staff" : "member",
      },
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}
export async function updateProfile(email: string, data: {
  salutation: string;
  first_mid_name: string;
  last_name: string;
  kewarganegaraan: string;
  country_code: string;
  mobile_number: string;
  tanggal_lahir: string;
}) {
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE pengguna SET
        salutation = $1,
        first_mid_name = $2,
        last_name = $3,
        kewarganegaraan = $4,
        country_code = $5,
        mobile_number = $6,
        tanggal_lahir = $7
       WHERE LOWER(email) = LOWER($8)`,
      [
        data.salutation,
        data.first_mid_name,
        data.last_name,
        data.kewarganegaraan,
        data.country_code,
        data.mobile_number,
        data.tanggal_lahir,
        email,
      ]
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}
export async function getDashboardData(email: string, role: "member" | "staff") {
  const client = await pool.connect();
  try {
    if (role === "member") {
      const profileRes = await client.query(
        `SELECT 
          m.nomor_member, m.tanggal_bergabung, m.award_miles, m.total_miles,
          t.nama AS nama_tier,
          p.first_mid_name, p.last_name, p.kewarganegaraan,
          p.tanggal_lahir, p.country_code, p.mobile_number
         FROM member m
         JOIN pengguna p ON LOWER(p.email) = LOWER(m.email)
         JOIN tier t ON t.id_tier = m.id_tier
         WHERE LOWER(m.email) = LOWER($1)`,
        [email]
      );

      const transaksiRes = await client.query(
        `(
          SELECT
            CASE 
              WHEN LOWER(email_member_1) = LOWER($1) THEN 'Transfer Keluar'
              ELSE 'Transfer Masuk'
            END AS type,
            timestamp,
            CASE 
              WHEN LOWER(email_member_1) = LOWER($1) THEN -jumlah
              ELSE jumlah
            END AS amount
          FROM transfer
          WHERE LOWER(email_member_1) = LOWER($1) OR LOWER(email_member_2) = LOWER($1)
        )
        UNION ALL
        (
          SELECT
            'Redeem' AS type,
            r.timestamp,
            -h.miles AS amount
          FROM redeem r
          JOIN hadiah h ON h.kode_hadiah = r.kode_hadiah
          WHERE LOWER(r.email_member) = LOWER($1)
        )
        UNION ALL
        (
          SELECT
            'Beli Miles' AS type,
            mamp.timestamp,
            amp.jumlah_award_miles AS amount
          FROM member_award_miles_package mamp
          JOIN award_miles_package amp ON amp.id = mamp.id_award_miles_package
          WHERE LOWER(mamp.email_member) = LOWER($1)
        )
        ORDER BY timestamp DESC
        LIMIT 5`,
        [email]
      );

      return {
        success: true,
        role: "member",
        data: {
          ...profileRes.rows[0],
          transaksi: transaksiRes.rows,
        },
      };
    } else {
      const staffRes = await client.query(
        `SELECT
          s.id_staf, s.kode_maskapai, mk.nama_maskapai,
          p.first_mid_name, p.last_name, p.kewarganegaraan,
          p.tanggal_lahir, p.country_code, p.mobile_number,
          COUNT(*) FILTER (WHERE c.status_penerimaan = 'Menunggu') AS klaim_menunggu,
          COUNT(*) FILTER (WHERE c.status_penerimaan = 'Disetujui') AS klaim_disetujui,
          COUNT(*) FILTER (WHERE c.status_penerimaan = 'Ditolak') AS klaim_ditolak
         FROM staf s
         JOIN pengguna p ON LOWER(p.email) = LOWER(s.email)
         JOIN maskapai mk ON mk.kode_maskapai = s.kode_maskapai
         LEFT JOIN claim_missing_miles c ON LOWER(c.email_staf) = LOWER(s.email)
         WHERE LOWER(s.email) = LOWER($1)
         GROUP BY s.id_staf, s.kode_maskapai, mk.nama_maskapai,
                  p.first_mid_name, p.last_name, p.kewarganegaraan,
                  p.tanggal_lahir, p.country_code, p.mobile_number`,
        [email]
      );

      return {
        success: true,
        role: "staff",
        data: staffRes.rows[0],
      };
    }
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}