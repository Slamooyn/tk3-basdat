CREATE OR REPLACE FUNCTION check_duplicate_email()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pengguna 
        WHERE LOWER(email) = LOWER(NEW.email)
    ) THEN
        RAISE EXCEPTION 'ERROR: Email "%" sudah terdaftar, silakan gunakan email lain.', NEW.email;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_check_duplicate_email
BEFORE INSERT ON pengguna
FOR EACH ROW
EXECUTE FUNCTION check_duplicate_email();

CREATE OR REPLACE FUNCTION verify_login(
    p_email VARCHAR,
    p_password VARCHAR
)
RETURNS TABLE(
    email VARCHAR,
    salutation VARCHAR,
    first_mid_name VARCHAR,
    last_name VARCHAR,
    is_member BOOLEAN,
    is_staf BOOLEAN
) AS $$
DECLARE
    v_stored_password VARCHAR;
BEGIN
    SELECT p.password INTO v_stored_password
    FROM pengguna p
    WHERE LOWER(p.email) = LOWER(p_email);

    IF v_stored_password IS NULL OR v_stored_password <> p_password THEN
        RAISE EXCEPTION 'Email atau password salah, silakan coba lagi.';
    END IF;

    RETURN QUERY
    SELECT 
        p.email::VARCHAR,
        p.salutation::VARCHAR,
        p.first_mid_name::VARCHAR,
        p.last_name::VARCHAR,
        EXISTS(SELECT 1 FROM member m WHERE LOWER(m.email) = LOWER(p_email))::BOOLEAN,
        EXISTS(SELECT 1 FROM staf s WHERE LOWER(s.email) = LOWER(p_email))::BOOLEAN
    FROM pengguna p
    WHERE LOWER(p.email) = LOWER(p_email);
END;
$$ LANGUAGE plpgsql;