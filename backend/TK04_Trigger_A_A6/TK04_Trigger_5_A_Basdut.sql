CREATE OR REPLACE FUNCTION sync_miles_after_klaim_disetujui()
RETURNS TRIGGER AS $$
BEGIN
    -- Cek apakah status berubah menjadi 'Disetujui'
    IF NEW.status_penerimaan = 'Disetujui' AND OLD.status_penerimaan != 'Disetujui' THEN
        -- Update award_miles dan total_miles member
        UPDATE member
        SET 
            award_miles = award_miles + 1000,
            total_miles = total_miles + 1000
        WHERE email = NEW.email_member;

        -- Return pesan sukses
        RAISE NOTICE 'SUKSES: Total miles Member "%" telah diperbarui. Miles ditambahkan: 1000 miles dari klaim penerbangan "%".',
            NEW.email_member,
            NEW.flight_number;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Buat trigger pada tabel claim_missing_miles
CREATE OR REPLACE TRIGGER trigger_sync_miles_klaim
AFTER UPDATE ON claim_missing_miles
FOR EACH ROW
EXECUTE FUNCTION sync_miles_after_klaim_disetujui();

CREATE OR REPLACE FUNCTION get_top5_member_by_total_miles()
RETURNS TABLE (
    rank BIGINT,
    email VARCHAR,
    total_miles INT
) AS $$
DECLARE
    top_email VARCHAR;
    top_total_miles INT;
BEGIN
    -- Ambil peringkat 1 untuk pesan sukses
    SELECT m.email, m.total_miles
    INTO top_email, top_total_miles
    FROM member m
    ORDER BY m.total_miles DESC
    LIMIT 1;

    -- Return pesan sukses
    RAISE NOTICE 'SUKSES: Daftar Top 5 Member berdasarkan total miles berhasil diperbarui, dengan peringkat pertama "%" memiliki % miles.',
        top_email,
        top_total_miles;

    -- Return hasil top 5
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY m.total_miles DESC) AS rank, m.email, m.total_miles
    FROM member m
    ORDER BY m.total_miles DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;