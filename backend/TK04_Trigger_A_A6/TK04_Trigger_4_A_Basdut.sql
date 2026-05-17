CREATE OR REPLACE FUNCTION fn_check_duplicate_claim()
RETURNS TRIGGER AS $$
DECLARE
    v_exists INT;
BEGIN
    -- Cek apakah sudah ada klaim dengan kombinasi yang sama
    SELECT COUNT(*) INTO v_exists
    FROM claim_missing_miles
    WHERE email_member       = NEW.email_member
      AND flight_number      = NEW.flight_number
      AND tanggal_penerbangan = NEW.tanggal_penerbangan
      AND nomor_tiket        = NEW.nomor_tiket;

    IF v_exists > 0 THEN
        RAISE EXCEPTION 'ERROR: Klaim untuk penerbangan "%" pada tanggal "%" dengan nomor tiket "%" sudah pernah diajukan sebelumnya.',
            NEW.flight_number,
            TO_CHAR(NEW.tanggal_penerbangan, 'YYYY-MM-DD'),
            NEW.nomor_tiket;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_duplicate_claim ON claim_missing_miles;

CREATE TRIGGER trg_check_duplicate_claim
    BEFORE INSERT ON claim_missing_miles
    FOR EACH ROW
    EXECUTE FUNCTION fn_check_duplicate_claim();
    

CREATE TABLE IF NOT EXISTS tier_change_log (
  email VARCHAR(100) PRIMARY KEY,
  pesan TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION fn_update_member_tier()
RETURNS TRIGGER AS $$
DECLARE
  v_tier_lama  VARCHAR(10);
  v_tier_baru  VARCHAR(10);
  v_nama_lama  VARCHAR(50);
  v_nama_baru  VARCHAR(50);
  v_pesan      TEXT;
BEGIN
  IF NEW.total_miles = OLD.total_miles THEN
    RETURN NEW;
  END IF;

  v_tier_lama := OLD.id_tier;

  SELECT id_tier INTO v_tier_baru
  FROM tier
  WHERE minimal_tier_miles <= NEW.total_miles
  ORDER BY minimal_tier_miles DESC
  LIMIT 1;

  IF v_tier_baru IS NULL THEN
    SELECT id_tier INTO v_tier_baru
    FROM tier
    ORDER BY minimal_tier_miles ASC
    LIMIT 1;
  END IF;

  IF v_tier_baru <> v_tier_lama THEN
    NEW.id_tier := v_tier_baru;

    SELECT nama INTO v_nama_lama FROM tier WHERE id_tier = v_tier_lama;
    SELECT nama INTO v_nama_baru FROM tier WHERE id_tier = v_tier_baru;

    v_pesan := 'SUKSES: Tier Member "' || NEW.email || '" telah diperbarui dari "' 
               || v_nama_lama || '" menjadi "' || v_nama_baru 
               || '" berdasarkan total miles yang dimiliki.';

    RAISE NOTICE '%', v_pesan;

    -- Simpan pesan ke log agar bisa dibaca frontend
    INSERT INTO tier_change_log (email, pesan, updated_at)
    VALUES (NEW.email, v_pesan, NOW())
    ON CONFLICT (email) DO UPDATE
      SET pesan = EXCLUDED.pesan,
          updated_at = EXCLUDED.updated_at;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_member_tier ON member;

CREATE TRIGGER trg_update_member_tier
  BEFORE UPDATE OF total_miles ON member
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_member_tier();