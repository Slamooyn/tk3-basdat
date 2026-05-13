"use server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getDataBeliMiles(emailMember: string) {
  const client = await pool.connect();
  try {
    const [memberRes, packageRes] = await Promise.all([
      client.query(
        `SELECT award_miles FROM member WHERE LOWER(email) = LOWER($1)`,
        [emailMember]
      ),
      client.query(
        `SELECT id, jumlah_award_miles, harga_paket FROM award_miles_package ORDER BY jumlah_award_miles ASC`
      ),
    ]);

    return {
      success: true,
      award_miles: memberRes.rows[0]?.award_miles ?? 0,
      packages: packageRes.rows,
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// Logic manual karena trigger 3.2 belum dipasang teman
// Kalau trigger 3.2 sudah dipasang, hapus bagian UPDATE member di bawah
export async function beliMilesPackage(emailMember: string, idPackage: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const pkgRes = await client.query(
      `SELECT id, jumlah_award_miles FROM award_miles_package WHERE id = $1`,
      [idPackage]
    );
    if (pkgRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, message: "Package tidak ditemukan." };
    }
    const pkg = pkgRes.rows[0];

    await client.query(
      `INSERT INTO member_award_miles_package (id_award_miles_package, email_member, timestamp)
       VALUES ($1, $2, NOW())`,
      [idPackage, emailMember]
    );

    // Update award_miles DAN total_miles
    // Kalau trigger 3.2 sudah dipasang teman, hapus UPDATE ini
    await client.query(
      `UPDATE member
       SET award_miles = award_miles + $1,
           total_miles = total_miles + $1
       WHERE LOWER(email) = LOWER($2)`,
      [pkg.jumlah_award_miles, emailMember]
    );

    await client.query("COMMIT");

    const updated = await client.query(
      `SELECT award_miles FROM member WHERE LOWER(email) = LOWER($1)`,
      [emailMember]
    );

    return {
      success: true,
      message: `SUKSES: Pembelian package berhasil. Award miles dan total miles Anda bertambah ${pkg.jumlah_award_miles} miles.`,
      award_miles: updated.rows[0].award_miles,
    };
  } catch (err: any) {
    await client.query("ROLLBACK");
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}