--Trigger Nomor 4, Bagian 1
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
    
    
--Trigger Nomor 4, Bagian 2

CREATE OR REPLACE FUNCTION fn_update_member_tier()
RETURNS TRIGGER AS $$
DECLARE
    v_tier_lama  VARCHAR(10);
    v_tier_baru  VARCHAR(10);
    v_nama_lama  VARCHAR(50);
    v_nama_baru  VARCHAR(50);
BEGIN
    -- Hanya jalankan jika total_miles benar-benar berubah
    IF NEW.total_miles = OLD.total_miles THEN
        RETURN NEW;
    END IF;

    -- Simpan tier lama
    v_tier_lama := OLD.id_tier;

    -- Cari tier baru berdasarkan minimal_tier_miles tertinggi yang masih terpenuhi
    SELECT id_tier INTO v_tier_baru
    FROM tier
    WHERE minimal_tier_miles <= NEW.total_miles
    ORDER BY minimal_tier_miles DESC
    LIMIT 1;

    -- Jika tidak ditemukan tier (seharusnya tidak terjadi karena Blue = 0),
    -- fallback ke tier terendah
    IF v_tier_baru IS NULL THEN
        SELECT id_tier INTO v_tier_baru
        FROM tier
        ORDER BY minimal_tier_miles ASC
        LIMIT 1;
    END IF;

    -- Update tier jika berbeda
    IF v_tier_baru <> v_tier_lama THEN
        NEW.id_tier := v_tier_baru;

        -- Ambil nama tier lama dan baru untuk pesan
        SELECT nama INTO v_nama_lama FROM tier WHERE id_tier = v_tier_lama;
        SELECT nama INTO v_nama_baru FROM tier WHERE id_tier = v_tier_baru;

        RAISE NOTICE 'SUKSES: Tier Member "%" telah diperbarui dari "%" menjadi "%" berdasarkan total miles yang dimiliki.',
            NEW.email,
            v_nama_lama,
            v_nama_baru;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger jika sudah ada sebelumnya, lalu buat ulang
DROP TRIGGER IF EXISTS trg_update_member_tier ON member;

CREATE TRIGGER trg_update_member_tier
    BEFORE UPDATE OF total_miles ON member
    FOR EACH ROW
    EXECUTE FUNCTION fn_update_member_tier();