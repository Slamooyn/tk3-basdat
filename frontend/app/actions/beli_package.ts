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

export async function beliMilesPackage(emailMember: string, idPackage: string) {
  const client = await pool.connect();

  // Tangkap RAISE NOTICE dari:
  // - trigger 3.2 (pembelian package berhasil)
  // - trigger 4.2 (tier member berubah)
  const notices: string[] = [];
  client.on("notice", (msg) => {
    if (msg.message) notices.push(msg.message);
  });

  try {
    const pkgRes = await client.query(
      `SELECT id, jumlah_award_miles FROM award_miles_package WHERE id = $1`,
      [idPackage]
    );
    if (pkgRes.rows.length === 0) {
      return { success: false, message: "Package tidak ditemukan." };
    }
    const pkg = pkgRes.rows[0];

    // INSERT ke member_award_miles_package
    // Trigger 3.2 otomatis tambah award_miles DAN total_miles → RAISE NOTICE
    // Trigger 4.2 otomatis jalan karena total_miles berubah → RAISE NOTICE kalau tier naik
    await client.query(
      `INSERT INTO member_award_miles_package (id_award_miles_package, email_member, timestamp)
       VALUES ($1, $2, NOW())`,
      [idPackage, emailMember]
    );

    // Ambil award_miles terbaru setelah trigger 3.2 update
    const updated = await client.query(
      `SELECT award_miles FROM member WHERE LOWER(email) = LOWER($1)`,
      [emailMember]
    );

    // Pesan dari trigger 3.2
    const pesanPackage = notices.find((n) => n.startsWith("SUKSES: Pembelian"))
      ?? `SUKSES: Pembelian package berhasil. Award miles dan total miles Anda bertambah ${pkg.jumlah_award_miles} miles.`;

    // Pesan dari trigger 4.2 (kalau tier naik)
    const pesanTier = notices.find((n) => n.startsWith("SUKSES: Tier Member"));

    return {
      success: true,
      message: pesanPackage,
      tier_changed: !!pesanTier,
      tier_message: pesanTier ?? null,
      award_miles: updated.rows[0].award_miles,
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}