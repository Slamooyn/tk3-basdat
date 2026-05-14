-- TRIGGER 3.1
-- Validasi dan Update Saldo Award Miles saat Redeem Hadiah
-- Fired: BEFORE INSERT ON redeem
-- Cek: award_miles mencukupi DAN hadiah masih dalam periode aktif
-- Jika lolos: kurangi award_miles member

CREATE OR REPLACE FUNCTION fn_validasi_redeem_hadiah()
RETURNS TRIGGER AS $$
DECLARE
    v_hadiah_nama        VARCHAR(100);
    v_hadiah_miles       INT;
    v_hadiah_start       DATE;
    v_hadiah_end         DATE;
    v_saldo              INT;
    v_today              DATE := CURRENT_DATE;
BEGIN
    -- Ambil data hadiah
    SELECT nama, miles, valid_start_date, program_end
    INTO v_hadiah_nama, v_hadiah_miles, v_hadiah_start, v_hadiah_end
    FROM hadiah
    WHERE kode_hadiah = NEW.kode_hadiah;

    -- Cek periode aktif hadiah
    IF v_today < v_hadiah_start OR v_today > v_hadiah_end THEN
        RAISE EXCEPTION 'ERROR: Hadiah "%" tidak tersedia pada periode ini.',
            v_hadiah_nama;
    END IF;

    -- Ambil saldo award_miles member
    SELECT award_miles INTO v_saldo
    FROM member
    WHERE LOWER(email) = LOWER(NEW.email_member);

    -- Cek kecukupan saldo
    IF v_saldo < v_hadiah_miles THEN
        RAISE EXCEPTION 'ERROR: Saldo award miles tidak mencukupi. Dibutuhkan % miles, saldo Anda: % miles.',
            v_hadiah_miles,
            v_saldo;
    END IF;

    -- Kurangi award_miles member
    UPDATE member
    SET award_miles = award_miles - v_hadiah_miles
    WHERE LOWER(email) = LOWER(NEW.email_member);

    RAISE NOTICE 'SUKSES: Redeem hadiah "%" berhasil. Award miles Anda berkurang % miles.',
        v_hadiah_nama,
        v_hadiah_miles;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validasi_redeem_hadiah ON redeem;

CREATE TRIGGER trg_validasi_redeem_hadiah
    BEFORE INSERT ON redeem
    FOR EACH ROW
    EXECUTE FUNCTION fn_validasi_redeem_hadiah();

-- TRIGGER 3.2
-- Sinkronisasi Award Miles setelah Transaksi Pembelian Package
-- Fired: AFTER INSERT ON member_award_miles_package
-- Tambah award_miles DAN total_miles member sesuai jumlah package

CREATE OR REPLACE FUNCTION fn_sinkronisasi_miles_package()
RETURNS TRIGGER AS $$
DECLARE
    v_jumlah_miles INT;
BEGIN
    -- Ambil jumlah award_miles dari package yang dibeli
    SELECT jumlah_award_miles INTO v_jumlah_miles
    FROM award_miles_package
    WHERE id = NEW.id_award_miles_package;

    -- Tambah award_miles DAN total_miles
    UPDATE member
    SET award_miles = award_miles + v_jumlah_miles,
        total_miles = total_miles + v_jumlah_miles
    WHERE LOWER(email) = LOWER(NEW.email_member);

    RAISE NOTICE 'SUKSES: Pembelian package berhasil. Award miles dan total miles Anda bertambah % miles.',
        v_jumlah_miles;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sinkronisasi_miles_package ON member_award_miles_package;

CREATE TRIGGER trg_sinkronisasi_miles_package
    AFTER INSERT ON member_award_miles_package
    FOR EACH ROW
    EXECUTE FUNCTION fn_sinkronisasi_miles_package();