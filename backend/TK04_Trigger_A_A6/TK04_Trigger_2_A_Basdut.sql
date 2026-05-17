CREATE OR REPLACE FUNCTION check_transfer_saldo()
RETURNS TRIGGER AS $$
DECLARE
    v_saldo INT;
BEGIN
    SELECT award_miles INTO v_saldo
    FROM member
    WHERE email = NEW.email_member_1;

    IF v_saldo IS NULL THEN
        RAISE EXCEPTION 'ERROR: Member pengirim "%" tidak ditemukan.', NEW.email_member_1;
    END IF;

    IF NEW.jumlah <= 0 THEN
        RAISE EXCEPTION 'ERROR: Jumlah transfer harus lebih dari 0.';
    END IF;

    IF NEW.jumlah > v_saldo THEN
        RAISE EXCEPTION 'ERROR: Saldo award miles tidak mencukupi. Saldo Anda saat ini: % miles, jumlah transfer: % miles.',
            v_saldo, NEW.jumlah;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_check_transfer_saldo
BEFORE INSERT ON transfer
FOR EACH ROW
EXECUTE FUNCTION check_transfer_saldo();

CREATE OR REPLACE FUNCTION log_transfer_miles()
RETURNS TRIGGER AS $$
BEGIN

    UPDATE member
    SET award_miles = award_miles - NEW.jumlah
    WHERE email = NEW.email_member_1;

    UPDATE member
    SET award_miles = award_miles + NEW.jumlah,
        total_miles = total_miles + NEW.jumlah
    WHERE email = NEW.email_member_2;

    RAISE NOTICE 'SUKSES: Transfer % miles dari "%" ke "%" berhasil dicatat.',
        NEW.jumlah, NEW.email_member_1, NEW.email_member_2;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_log_transfer_miles
AFTER INSERT ON transfer
FOR EACH ROW
EXECUTE FUNCTION log_transfer_miles();