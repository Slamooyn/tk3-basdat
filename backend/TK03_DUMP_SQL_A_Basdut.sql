CREATE TABLE tier (
    id_tier VARCHAR(10) PRIMARY KEY,
    nama VARCHAR(50) NOT NULL,
    minimal_frekuensi_terbang INT NOT NULL,
    minimal_tier_miles INT NOT NULL);

CREATE TABLE pengguna (
    email VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    salutation VARCHAR(10) NOT NULL CHECK (salutation IN ('Mr.', 'Mrs.', 'Ms.', 'Dr.')),
    first_mid_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    kewarganegaraan VARCHAR(50) NOT NULL);

CREATE TABLE member (
    email VARCHAR(100) PRIMARY KEY,
    nomor_member VARCHAR(20)  NOT NULL UNIQUE,
    tanggal_bergabung DATE NOT NULL,
    id_tier VARCHAR(10) NOT NULL,
    award_miles INT DEFAULT 0,
    total_miles INT DEFAULT 0,
    CONSTRAINT fk_member_pengguna FOREIGN KEY (email) REFERENCES pengguna(email) ON DELETE CASCADE,
    CONSTRAINT fk_member_tier FOREIGN KEY (id_tier) REFERENCES tier(id_tier));

CREATE TABLE penyedia (
    id SERIAL PRIMARY KEY);

CREATE TABLE maskapai (
    kode_maskapai VARCHAR(10) PRIMARY KEY,
    nama_maskapai VARCHAR(100) NOT NULL,
    id_penyedia INT NOT NULL,
    CONSTRAINT fk_maskapai_penyedia FOREIGN KEY (id_penyedia) REFERENCES penyedia(id));

CREATE TABLE staf (
    email VARCHAR(100) PRIMARY KEY,
    id_staf VARCHAR(20)  NOT NULL UNIQUE,
    kode_maskapai VARCHAR(10)  NOT NULL,
    CONSTRAINT fk_staf_pengguna FOREIGN KEY (email) REFERENCES pengguna(email),
    CONSTRAINT fk_staf_maskapai FOREIGN KEY (kode_maskapai) REFERENCES maskapai(kode_maskapai));

CREATE TABLE mitra (
    email_mitra VARCHAR(100) PRIMARY KEY,
    id_penyedia INT NOT NULL UNIQUE,
    nama_mitra VARCHAR(100) NOT NULL,
    tanggal_kerja_sama DATE NOT NULL,
    CONSTRAINT fk_mitra_penyedia FOREIGN KEY (id_penyedia) REFERENCES penyedia(id) ON DELETE CASCADE);

CREATE TABLE identitas (
    nomor VARCHAR(50) PRIMARY KEY,
    email_member VARCHAR(100) NOT NULL,
    tanggal_habis DATE NOT NULL,
    tanggal_terbit DATE NOT NULL,
    negara_penerbit VARCHAR(50) NOT NULL,
    jenis VARCHAR(30) NOT NULL CHECK (jenis IN ('Paspor', 'KTP', 'SIM')),
    CONSTRAINT fk_identitas_member FOREIGN KEY (email_member) REFERENCES member(email) ON DELETE CASCADE);

CREATE TABLE award_miles_package (
    id VARCHAR(20) PRIMARY KEY,
    harga_paket DECIMAL(15, 2) NOT NULL,
    jumlah_award_miles INT NOT NULL);

CREATE TABLE member_award_miles_package (
    id_award_miles_package VARCHAR(20) NOT NULL,
    email_member VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    PRIMARY KEY (id_award_miles_package, email_member, timestamp),
    CONSTRAINT fk_mamp_package FOREIGN KEY (id_award_miles_package) REFERENCES award_miles_package(id),
    CONSTRAINT fk_mamp_member  FOREIGN KEY (email_member) REFERENCES member(email) ON DELETE CASCADE);

CREATE TABLE bandara (
    iata_code VARCHAR(3) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kota VARCHAR(100) NOT NULL,
    negara VARCHAR(100) NOT NULL);

CREATE TABLE claim_missing_miles (
    id SERIAL PRIMARY KEY,
    email_member VARCHAR(100) NOT NULL,
    email_staf VARCHAR(100),
    maskapai VARCHAR(10) NOT NULL,
    bandara_asal VARCHAR(3) NOT NULL,
    bandara_tujuan VARCHAR(3) NOT NULL,
    tanggal_penerbangan DATE NOT NULL,
    flight_number VARCHAR(10) NOT NULL,
    nomor_tiket VARCHAR(20) NOT NULL,
    kelas_kabin VARCHAR(20) NOT NULL CHECK (kelas_kabin IN ('Economy', 'Business', 'First')),
    pnr VARCHAR(10) NOT NULL,
    status_penerimaan VARCHAR(20) NOT NULL DEFAULT 'Menunggu' CHECK (status_penerimaan IN ('Menunggu', 'Disetujui', 'Ditolak')),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cmm_member FOREIGN KEY (email_member) REFERENCES member(email) ON DELETE CASCADE,
    CONSTRAINT fk_cmm_staf FOREIGN KEY (email_staf) REFERENCES staf(email),
    CONSTRAINT fk_cmm_maskapai FOREIGN KEY (maskapai) REFERENCES maskapai(kode_maskapai),
    CONSTRAINT fk_cmm_bandara_asal FOREIGN KEY (bandara_asal) REFERENCES bandara(iata_code),
    CONSTRAINT fk_cmm_bandara_tujuan FOREIGN KEY (bandara_tujuan) REFERENCES bandara(iata_code),
    CONSTRAINT uq_cmm_duplikat UNIQUE (email_member, flight_number, tanggal_penerbangan, nomor_tiket));

CREATE TABLE transfer (
    email_member_1 VARCHAR(100) NOT NULL,
    email_member_2 VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    jumlah INT NOT NULL,
    catatan VARCHAR(255),
    PRIMARY KEY (email_member_1, email_member_2, timestamp),
    CONSTRAINT fk_transfer_pengirim FOREIGN KEY (email_member_1) REFERENCES member(email) ON DELETE CASCADE,
    CONSTRAINT fk_transfer_penerima FOREIGN KEY (email_member_2) REFERENCES member(email) ON DELETE CASCADE,
    CONSTRAINT chk_transfer_beda_member CHECK (email_member_1 <> email_member_2));

CREATE TABLE hadiah (
    kode_hadiah VARCHAR(20) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    miles INT NOT NULL,
    deskripsi TEXT,
    valid_start_date DATE NOT NULL,
    program_end DATE NOT NULL,
    id_penyedia INT NOT NULL,
    CONSTRAINT fk_hadiah_penyedia FOREIGN KEY (id_penyedia) REFERENCES penyedia(id) ON DELETE CASCADE);
 
CREATE TABLE redeem (
    email_member VARCHAR(100) NOT NULL,
    kode_hadiah VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    PRIMARY KEY (email_member, kode_hadiah, timestamp),
    CONSTRAINT fk_redeem_member FOREIGN KEY (email_member) REFERENCES member(email) ON DELETE CASCADE,
    CONSTRAINT fk_redeem_hadiah FOREIGN KEY (kode_hadiah)  REFERENCES hadiah(kode_hadiah));

INSERT INTO pengguna (email, password, salutation, first_mid_name, last_name, country_code, mobile_number, tanggal_lahir, kewarganegaraan) VALUES
('budi.santoso@gmail.com', '$2b$12$abc123hashedpassword01', 'Mr.', 'Budi', 'Santoso', '+62', '08111234501', '1990-03-15', 'Indonesia'),
('siti.rahayu@gmail.com', '$2b$12$abc123hashedpassword02', 'Mrs.', 'Siti', 'Rahayu', '+62', '08111234502', '1985-07-22', 'Indonesia'),
('ahmad.fauzi@yahoo.com', '$2b$12$abc123hashedpassword03', 'Mr.', 'Ahmad Fauzi', 'Hidayat', '+62', '08111234503', '1992-11-10', 'Indonesia'),
('dewi.lestari@gmail.com', '$2b$12$abc123hashedpassword04', 'Ms.', 'Dewi', 'Lestari', '+62', '08111234504', '1995-04-28', 'Indonesia'),
('dr.hendra@gmail.com', '$2b$12$abc123hashedpassword05', 'Dr.', 'Hendra', 'Wijaya', '+62', '08111234505', '1978-09-05', 'Indonesia'),
('rina.marlina@gmail.com', '$2b$12$abc123hashedpassword06', 'Mrs.', 'Rina', 'Marlina', '+62', '08111234506', '1983-01-17', 'Indonesia'),
('yusuf.pratama@gmail.com', '$2b$12$abc123hashedpassword07', 'Mr.', 'Yusuf', 'Pratama', '+62', '08111234507', '1988-06-30', 'Indonesia'),
('nurhasanah@gmail.com', '$2b$12$abc123hashedpassword08', 'Ms.', 'Nur', 'Hasanah', '+62', '08111234508', '1997-12-03', 'Indonesia'),
('bambang.irawan@gmail.com', '$2b$12$abc123hashedpassword09', 'Mr.', 'Bambang', 'Irawan', '+62', '08111234509', '1975-08-19', 'Indonesia'),
('dr.maya@yahoo.com', '$2b$12$abc123hashedpassword10', 'Dr.', 'Maya', 'Sari', '+62', '08111234510', '1980-02-14', 'Indonesia'),
('kevin.tan@gmail.com', '$2b$12$abc123hashedpassword11', 'Mr.', 'Kevin', 'Tan', '+65', '08111234511', '1993-05-21', 'Singapura'),
('lisa.wong@gmail.com', '$2b$12$abc123hashedpassword12', 'Ms.', 'Lisa', 'Wong', '+60', '08111234512', '1991-10-08', 'Malaysia'),
('andre.setiawan@gmail.com', '$2b$12$abc123hashedpassword13', 'Mr.', 'Andre', 'Setiawan', '+62', '08111234513', '1989-03-25', 'Indonesia'),
('fitri.handayani@gmail.com', '$2b$12$abc123hashedpassword14', 'Ms.', 'Fitri', 'Handayani', '+62', '08111234514', '1996-07-11', 'Indonesia'),
('rudi.hartono@gmail.com', '$2b$12$abc123hashedpassword15', 'Mr.', 'Rudi', 'Hartono', '+62', '08111234515', '1987-11-29', 'Indonesia'),
('maria.susanti@gmail.com', '$2b$12$abc123hashedpassword16', 'Mrs.', 'Maria', 'Susanti', '+62', '08111234516', '1984-04-06', 'Indonesia'),
('eko.prasetyo@gmail.com', '$2b$12$abc123hashedpassword17', 'Mr.', 'Eko', 'Prasetyo', '+62', '08111234517', '1994-09-13', 'Indonesia'),
('indah.permata@gmail.com', '$2b$12$abc123hashedpassword18', 'Ms.', 'Indah', 'Permata', '+62', '08111234518', '1998-01-27', 'Indonesia'),
('dr.wahyu@gmail.com', '$2b$12$abc123hashedpassword19', 'Dr.', 'Wahyu', 'Nugroho', '+62', '08111234519', '1976-06-04', 'Indonesia'),
('sukmawati@gmail.com', '$2b$12$abc123hashedpassword20', 'Mrs.', 'Sukma', 'Wati', '+62', '08111234520', '1982-12-18', 'Indonesia'),
('james.lee@gmail.com', '$2b$12$abc123hashedpassword21', 'Mr.', 'James', 'Lee', '+65', '08111234521', '1990-08-07', 'Singapura'),
('rachel.lim@gmail.com', '$2b$12$abc123hashedpassword22', 'Ms.', 'Rachel', 'Lim', '+60', '08111234522', '1994-02-23', 'Malaysia'),
('agus.kurniawan@gmail.com', '$2b$12$abc123hashedpassword23', 'Mr.', 'Agus', 'Kurniawan', '+62', '08111234523', '1986-05-16', 'Indonesia'),
('dr.sinta@gmail.com', '$2b$12$abc123hashedpassword24', 'Dr.', 'Sinta', 'Dewi', '+62', '08111234524', '1979-10-31', 'Indonesia'),
('fajar.ramadhan@gmail.com', '$2b$12$abc123hashedpassword25', 'Mr.', 'Fajar', 'Ramadhan', '+62', '08111234525', '1995-03-09', 'Indonesia'),
('ayu.maharani@gmail.com', '$2b$12$abc123hashedpassword26', 'Ms.', 'Ayu', 'Maharani', '+62', '08111234526', '1997-07-24', 'Indonesia'),
('dodi.hermawan@gmail.com', '$2b$12$abc123hashedpassword27', 'Mr.', 'Dodi', 'Hermawan', '+62', '08111234527', '1981-11-02', 'Indonesia'),
('sri.mulyani@gmail.com', '$2b$12$abc123hashedpassword28', 'Mrs.', 'Sri', 'Mulyani', '+62', '08111234528', '1977-04-20', 'Indonesia'),
('galih.saputra@gmail.com', '$2b$12$abc123hashedpassword29', 'Mr.', 'Galih', 'Saputra', '+62', '08111234529', '1993-09-07', 'Indonesia'),
('dr.anita@yahoo.com', '$2b$12$abc123hashedpassword30', 'Dr.', 'Anita', 'Kusuma', '+62', '08111234530', '1974-01-15', 'Indonesia'),
('tony.nguyen@gmail.com', '$2b$12$abc123hashedpassword31', 'Mr.', 'Tony', 'Nguyen', '+84', '08111234531', '1988-06-28', 'Vietnam'),
('sophia.chen@gmail.com', '$2b$12$abc123hashedpassword32', 'Ms.', 'Sophia', 'Chen', '+86', '08111234532', '1992-11-14', 'China'),
('haris.maulana@gmail.com', '$2b$12$abc123hashedpassword33', 'Mr.', 'Haris', 'Maulana', '+62', '08111234533', '1990-02-01', 'Indonesia'),
('lina.oktavia@gmail.com', '$2b$12$abc123hashedpassword34', 'Ms.', 'Lina', 'Oktavia', '+62', '08111234534', '1996-05-19', 'Indonesia'),
('teguh.wibowo@gmail.com', '$2b$12$abc123hashedpassword35', 'Mr.', 'Teguh', 'Wibowo', '+62', '08111234535', '1984-08-26', 'Indonesia'),
('ratna.dewi@gmail.com', '$2b$12$abc123hashedpassword36', 'Mrs.', 'Ratna', 'Dewi', '+62', '08111234536', '1986-12-10', 'Indonesia'),
('irfan.hakim@gmail.com', '$2b$12$abc123hashedpassword37', 'Mr.', 'Irfan', 'Hakim', '+62', '08111234537', '1991-04-03', 'Indonesia'),
('dr.putri@gmail.com', '$2b$12$abc123hashedpassword38', 'Dr.', 'Putri', 'Anjani', '+62', '08111234538', '1977-09-21', 'Indonesia'),
('samuel.tan@gmail.com', '$2b$12$abc123hashedpassword39', 'Mr.', 'Samuel', 'Tan', '+65', '08111234539', '1989-01-08', 'Singapura'),
('clara.wijaya@gmail.com', '$2b$12$abc123hashedpassword40', 'Ms.', 'Clara', 'Wijaya', '+62', '08111234540', '1995-06-17', 'Indonesia'),
('bagas.nugroho@gmail.com', '$2b$12$abc123hashedpassword41', 'Mr.', 'Bagas', 'Nugroho', '+62', '08111234541', '1993-10-04', 'Indonesia'),
('endang.susilowati@gmail.com', '$2b$12$abc123hashedpassword42', 'Mrs.', 'Endang', 'Susilowati', '+62', '08111234542', '1980-03-22', 'Indonesia'),
('rizky.firmansyah@gmail.com', '$2b$12$abc123hashedpassword43', 'Mr.', 'Rizky', 'Firmansyah', '+62', '08111234543', '1997-07-09', 'Indonesia'),
('nadia.safitri@gmail.com', '$2b$12$abc123hashedpassword44', 'Ms.', 'Nadia', 'Safitri', '+62', '08111234544', '1999-11-27', 'Indonesia'),
('dr.arief@gmail.com', '$2b$12$abc123hashedpassword45', 'Dr.', 'Arief', 'Budiman', '+62', '08111234545', '1973-05-14', 'Indonesia'),
('winda.puspita@gmail.com', '$2b$12$abc123hashedpassword46', 'Mrs.', 'Winda', 'Puspita', '+62', '08111234546', '1985-09-01', 'Indonesia'),
('faisal.rahman@gmail.com', '$2b$12$abc123hashedpassword47', 'Mr.', 'Faisal', 'Rahman', '+62', '08111234547', '1988-02-18', 'Indonesia'),
('tiara.anggraini@gmail.com', '$2b$12$abc123hashedpassword48', 'Ms.', 'Tiara', 'Anggraini', '+62', '08111234548', '1994-06-05', 'Indonesia'),
('daniel.park@gmail.com', '$2b$12$abc123hashedpassword49', 'Mr.', 'Daniel', 'Park', '+82', '08111234549', '1991-10-23', 'Korea Selatan'),
('michiko.tanaka@gmail.com', '$2b$12$abc123hashedpassword50', 'Ms.', 'Michiko', 'Tanaka', '+81', '08111234550', '1993-03-11', 'Jepang'),
('andi.gunawan@gmail.com', '$2b$12$abc123hashedpassword51', 'Mr.', 'Andi', 'Gunawan', '+62', '08111234551', '1987-07-30', 'Indonesia'),
('yeni.angkasa@gmail.com', '$2b$12$abc123hashedpassword52', 'Mrs.', 'Yeni', 'Angkasa', '+62', '08111234552', '1983-12-17', 'Indonesia'),
('dimas.ardiansyah@gmail.com', '$2b$12$abc123hashedpassword53', 'Mr.', 'Dimas', 'Ardiansyah', '+62', '08111234553', '1996-04-24', 'Indonesia'),
('laras.setiawati@gmail.com', '$2b$12$abc123hashedpassword54', 'Ms.', 'Laras', 'Setiawati', '+62', '08111234554', '1998-08-12', 'Indonesia'),
('dr.baskoro@gmail.com', '$2b$12$abc123hashedpassword55', 'Dr.', 'Baskoro', 'Adi', '+62', '08111234555', '1971-01-29', 'Indonesia'),
('helmi.syahputra@gmail.com', '$2b$12$abc123hashedpassword56', 'Mr.', 'Helmi', 'Syahputra', '+62', '08111234556', '1990-06-15', 'Indonesia'),
('rara.ayu@gmail.com', '$2b$12$abc123hashedpassword57', 'Ms.', 'Rara', 'Ayu', '+62', '08111234557', '1995-10-02', 'Indonesia'),
('wahid.abdurrahman@gmail.com', '$2b$12$abc123hashedpassword58', 'Mr.', 'Wahid', 'Abdurrahman', '+62', '08111234558', '1985-02-20', 'Indonesia'),
('dr.natalia@gmail.com', '$2b$12$abc123hashedpassword59', 'Dr.', 'Natalia', 'Santoso', '+62', '08111234559', '1976-05-07', 'Indonesia'),
('ivan.christianto@gmail.com', '$2b$12$abc123hashedpassword60', 'Mr.', 'Ivan', 'Christianto', '+62', '08111234560', '1992-09-25', 'Indonesia');

INSERT INTO tier (id_tier, nama, minimal_frekuensi_terbang, minimal_tier_miles) VALUES
('TIER-BLU', 'Blue', 0, 0),
('TIER-SLV', 'Silver',  10,  15000),
('TIER-GLD', 'Gold',    25,  40000),
('TIER-PLT', 'Platinum', 50, 80000);

INSERT INTO member (email, nomor_member, tanggal_bergabung, id_tier, award_miles, total_miles) VALUES
('budi.santoso@gmail.com',      'MB2021000001', '2021-03-10', 'TIER-BLU',  3200,   5800),
('siti.rahayu@gmail.com',       'MB2021000002', '2021-05-22', 'TIER-BLU',  1500,   2300),
('ahmad.fauzi@yahoo.com',       'MB2022000003', '2022-01-15', 'TIER-BLU',  4800,   7200),
('dewi.lestari@gmail.com',      'MB2022000004', '2022-04-03', 'TIER-BLU',   900,   1500),
('rina.marlina@gmail.com',      'MB2022000005', '2022-07-19', 'TIER-BLU',  2700,   4100),
('nurhasanah@gmail.com',        'MB2023000006', '2023-02-28', 'TIER-BLU',   500,    800),
('indah.permata@gmail.com',     'MB2023000007', '2023-05-11', 'TIER-BLU',  1200,   1900),
('sukmawati@gmail.com',         'MB2023000008', '2023-06-30', 'TIER-BLU',  3500,   5200),
('fitri.handayani@gmail.com',   'MB2023000009', '2023-08-14', 'TIER-BLU',  2100,   3400),
('ayu.maharani@gmail.com',      'MB2023000010', '2023-09-05', 'TIER-BLU',   750,   1100),
('kevin.tan@gmail.com',         'MB2021000011', '2021-11-20', 'TIER-BLU',  4200,   6700),
('lisa.wong@gmail.com',         'MB2022000012', '2022-03-08', 'TIER-BLU',  3100,   4900),
('lina.oktavia@gmail.com',      'MB2023000013', '2023-01-17', 'TIER-BLU',  1800,   2600),
('tiara.anggraini@gmail.com',   'MB2023000014', '2023-10-01', 'TIER-BLU',   300,    500),
('nadia.safitri@gmail.com',     'MB2024000015', '2024-01-09', 'TIER-BLU',   100,    200),
('samuel.tan@gmail.com',        'MB2024000016', '2024-02-14', 'TIER-BLU',   450,    700),
('clara.wijaya@gmail.com',      'MB2024000017', '2024-03-22', 'TIER-BLU',   600,   1000),
('laras.setiawati@gmail.com',   'MB2024000018', '2024-04-10', 'TIER-BLU',   200,    350),
('rara.ayu@gmail.com',          'MB2024000019', '2024-05-18', 'TIER-BLU',   800,   1300),
('michiko.tanaka@gmail.com',    'MB2024000020', '2024-06-25', 'TIER-BLU',   150,    250),
('dr.hendra@gmail.com',         'MB2020000021', '2020-09-12', 'TIER-SLV', 18500,  32000),
('bambang.irawan@gmail.com',    'MB2020000022', '2020-11-04', 'TIER-SLV', 22000,  38500),
('andre.setiawan@gmail.com',    'MB2021000023', '2021-02-17', 'TIER-SLV', 16800,  28000),
('rudi.hartono@gmail.com',      'MB2021000024', '2021-04-29', 'TIER-SLV', 25000,  37000),
('eko.prasetyo@gmail.com',      'MB2021000025', '2021-07-06', 'TIER-SLV', 19200,  30500),
('galih.saputra@gmail.com',     'MB2021000026', '2021-08-23', 'TIER-SLV', 21000,  35000),
('agus.kurniawan@gmail.com',    'MB2022000027', '2022-01-31', 'TIER-SLV', 17500,  27000),
('fajar.ramadhan@gmail.com',    'MB2022000028', '2022-05-14', 'TIER-SLV', 23500,  39000),
('irfan.hakim@gmail.com',       'MB2022000029', '2022-09-27', 'TIER-SLV', 15500,  26000),
('bagas.nugroho@gmail.com',     'MB2022000030', '2022-12-05', 'TIER-SLV', 20000,  33000),
('tony.nguyen@gmail.com',       'MB2021000031', '2021-06-18', 'TIER-SLV', 16000,  25500),
('sophia.chen@gmail.com',       'MB2021000032', '2021-10-09', 'TIER-SLV', 24000,  38000),
('haris.maulana@gmail.com',     'MB2022000033', '2022-02-20', 'TIER-SLV', 18000,  29000),
('teguh.wibowo@gmail.com',      'MB2020000034', '2020-08-15', 'TIER-SLV', 26000,  39500),
('rizky.firmansyah@gmail.com',  'MB2023000035', '2023-03-12', 'TIER-SLV', 15200,  25000),
('dr.maya@yahoo.com',           'MB2019000036', '2019-04-08', 'TIER-GLD', 52000,  85000),
('yusuf.pratama@gmail.com',     'MB2019000037', '2019-07-21', 'TIER-GLD', 48000,  76000),
('maria.susanti@gmail.com',     'MB2019000038', '2019-10-14', 'TIER-GLD', 61000,  92000),
('dr.wahyu@gmail.com',          'MB2018000039', '2018-12-03', 'TIER-GLD', 55000,  88000),
('dodi.hermawan@gmail.com',     'MB2019000040', '2019-03-27', 'TIER-GLD', 43000,  71000),
('ratna.dewi@gmail.com',        'MB2020000041', '2020-02-11', 'TIER-GLD', 57000,  90000),
('faisal.rahman@gmail.com',     'MB2020000042', '2020-05-30', 'TIER-GLD', 41500,  68000),
('daniel.park@gmail.com',       'MB2019000043', '2019-11-19', 'TIER-GLD', 63000,  95000),
('endang.susilowati@gmail.com', 'MB2018000044', '2018-07-07', 'TIER-GLD', 49000,  79000),
('winda.puspita@gmail.com',     'MB2020000045', '2020-09-24', 'TIER-GLD', 44500,  72000),
('dr.anita@yahoo.com',          'MB2017000046', '2017-06-15', 'TIER-PLT', 125000, 210000),
('sri.mulyani@gmail.com',       'MB2016000047', '2016-03-20', 'TIER-PLT', 98000,  175000),
('dr.baskoro@gmail.com',        'MB2015000048', '2015-11-08', 'TIER-PLT', 145000, 250000),
('dr.sinta@gmail.com',          'MB2016000049', '2016-09-30', 'TIER-PLT', 112000, 195000),
('dr.arief@gmail.com',          'MB2017000050', '2017-04-12', 'TIER-PLT', 89000,  160000);

INSERT INTO penyedia (id) VALUES
(1),
(2),
(3),
(4),
(5),
(6),
(7),
(8),
(9),
(10);

INSERT INTO maskapai (kode_maskapai, nama_maskapai, id_penyedia) VALUES
('GA',  'Garuda Indonesia',   1),
('JT',  'Lion Air',           2),
('QZ',  'AirAsia Indonesia',  3),
('SJ',  'Sriwijaya Air',      4),
('ID',  'Batik Air',          5);

INSERT INTO staf (email, id_staf, kode_maskapai) VALUES
('james.lee@gmail.com',        'STF2024000001', 'GA'),
('rachel.lim@gmail.com',       'STF2024000002', 'GA'),
('dr.putri@gmail.com',         'STF2024000003', 'JT'),
('andi.gunawan@gmail.com',     'STF2024000004', 'JT'),
('yeni.angkasa@gmail.com',     'STF2024000005', 'QZ'),
('dimas.ardiansyah@gmail.com', 'STF2024000006', 'QZ'),
('helmi.syahputra@gmail.com',  'STF2024000007', 'SJ'),
('wahid.abdurrahman@gmail.com','STF2024000008', 'SJ'),
('dr.natalia@gmail.com',       'STF2024000009', 'ID'),
('ivan.christianto@gmail.com', 'STF2024000010', 'ID');

INSERT INTO mitra (email_mitra, id_penyedia, nama_mitra, tanggal_kerja_sama) VALUES
('partnership@hotelmulia.com',    6,  'Hotel Mulia',          '2019-03-15'),
('partner@traveloka.com',         7,  'Traveloka',            '2020-06-01'),
('mitra@hertzindonesia.com',      8,  'Hertz Indonesia',      '2021-01-20'),
('partner@tiket.com',             9,  'Tiket.com',            '2022-08-10'),
('kerjasama@bluebirdindonesia.com',10, 'Blue Bird Group',     '2023-04-05');

INSERT INTO identitas (nomor, email_member, tanggal_habis, tanggal_terbit, negara_penerbit, jenis) VALUES
('A1234501',  'budi.santoso@gmail.com',      '2029-03-15', '2019-03-15', 'Indonesia',     'Paspor'),
('A1234502',  'siti.rahayu@gmail.com',        '2030-07-22', '2020-07-22', 'Indonesia',     'Paspor'),
('A1234503',  'ahmad.fauzi@yahoo.com',        '2028-11-10', '2018-11-10', 'Indonesia',     'Paspor'),
('A1234504',  'dr.hendra@gmail.com',          '2027-09-05', '2017-09-05', 'Indonesia',     'Paspor'),
('A1234505',  'bambang.irawan@gmail.com',     '2026-08-19', '2016-08-19', 'Indonesia',     'Paspor'),
('A1234506',  'dr.maya@yahoo.com',            '2029-02-14', '2019-02-14', 'Indonesia',     'Paspor'),
('A1234507',  'dr.wahyu@gmail.com',           '2028-06-04', '2018-06-04', 'Indonesia',     'Paspor'),
('A1234508',  'dr.anita@yahoo.com',           '2027-01-15', '2017-01-15', 'Indonesia',     'Paspor'),
('A1234509',  'sri.mulyani@gmail.com',        '2026-04-20', '2016-04-20', 'Indonesia',     'Paspor'),
('A1234510',  'dr.baskoro@gmail.com',         '2029-01-29', '2019-01-29', 'Indonesia',     'Paspor'),
('S7654321',  'kevin.tan@gmail.com',          '2028-05-21', '2018-05-21', 'Singapura',     'Paspor'),
('M9876543',  'lisa.wong@gmail.com',          '2027-10-08', '2017-10-08', 'Malaysia',      'Paspor'),
('V1122334',  'tony.nguyen@gmail.com',        '2029-06-28', '2019-06-28', 'Vietnam',       'Paspor'),
('C5566778',  'sophia.chen@gmail.com',        '2028-11-14', '2018-11-14', 'China',         'Paspor'),
('K3344556',  'daniel.park@gmail.com',        '2027-10-23', '2017-10-23', 'Korea Selatan', 'Paspor'),
('J7788990',  'michiko.tanaka@gmail.com',     '2029-03-11', '2019-03-11', 'Jepang',        'Paspor'),
('3271010301900001', 'dewi.lestari@gmail.com',      '2047-04-28', '2017-04-28', 'Indonesia', 'KTP'),
('3275015507850001', 'rina.marlina@gmail.com',       '2047-01-17', '2017-01-17', 'Indonesia', 'KTP'),
('3273016006880001', 'yusuf.pratama@gmail.com',      '2047-06-30', '2017-06-30', 'Indonesia', 'KTP'),
('3271012803970001', 'nurhasanah@gmail.com',          '2047-12-03', '2017-12-03', 'Indonesia', 'KTP'),
('3277011105940001', 'fitri.handayani@gmail.com',    '2047-07-11', '2017-07-11', 'Indonesia', 'KTP'),
('3275020609870001', 'rudi.hartono@gmail.com',        '2047-11-29', '2017-11-29', 'Indonesia', 'KTP'),
('3273011304840001', 'maria.susanti@gmail.com',       '2047-04-06', '2017-04-06', 'Indonesia', 'KTP'),
('3271011309940001', 'eko.prasetyo@gmail.com',        '2047-09-13', '2017-09-13', 'Indonesia', 'KTP'),
('SIM3271010001',   'andre.setiawan@gmail.com',   '2027-03-25', '2022-03-25', 'Indonesia', 'SIM'),
('SIM3275020002',   'agus.kurniawan@gmail.com',   '2026-05-16', '2021-05-16', 'Indonesia', 'SIM'),
('SIM3273010003',   'fajar.ramadhan@gmail.com',   '2028-03-09', '2023-03-09', 'Indonesia', 'SIM'),
('SIM3277010004',   'haris.maulana@gmail.com',    '2027-02-01', '2022-02-01', 'Indonesia', 'SIM'),
('SIM3271020005',   'teguh.wibowo@gmail.com',     '2026-08-26', '2021-08-26', 'Indonesia', 'SIM'),
('SIM3275010006',   'galih.saputra@gmail.com',    '2028-09-07', '2023-09-07', 'Indonesia', 'SIM');

INSERT INTO award_miles_package (id, harga_paket, jumlah_award_miles) VALUES
('AMP-1000',   150000.00,   1000),
('AMP-3000',   400000.00,   3000),
('AMP-5000',   625000.00,   5000),
('AMP-10000', 1150000.00,  10000),
('AMP-25000', 2500000.00,  25000);

INSERT INTO bandara (iata_code, nama, kota, negara) VALUES
('CGK', 'Bandar Udara Internasional Soekarno-Hatta',              'Tangerang',    'Indonesia'),
('DPS', 'Bandar Udara Internasional Ngurah Rai',                   'Denpasar',     'Indonesia'),
('SUB', 'Bandar Udara Internasional Juanda',                       'Surabaya',     'Indonesia'),
('UPG', 'Bandar Udara Internasional Sultan Hasanuddin',            'Makassar',     'Indonesia'),
('KNO', 'Bandar Udara Internasional Kualanamu',                    'Medan',        'Indonesia'),
('BPN', 'Bandar Udara Internasional Sultan Aji Sulaiman Sepinggan','Balikpapan',   'Indonesia'),
('LOP', 'Bandar Udara Internasional Zainuddin Abdul Madjid',       'Lombok',       'Indonesia'),
('MDC', 'Bandar Udara Internasional Sam Ratulangi',                'Manado',       'Indonesia'),
('SIN', 'Bandar Udara Internasional Changi',                       'Singapura',    'Singapura'),
('KUL', 'Bandar Udara Internasional Kuala Lumpur',                 'Kuala Lumpur', 'Malaysia'),
('BKK', 'Bandar Udara Internasional Suvarnabhumi',                 'Bangkok',      'Thailand'),
('HKG', 'Bandar Udara Internasional Hong Kong',                    'Hong Kong',    'Hong Kong'),
('NRT', 'Bandar Udara Internasional Narita',                       'Tokyo',        'Jepang'),
('ICN', 'Bandar Udara Internasional Incheon',                      'Seoul',        'Korea Selatan'),
('SYD', 'Bandar Udara Internasional Kingsford Smith',              'Sydney',       'Australia');

INSERT INTO member_award_miles_package (id_award_miles_package, email_member, timestamp) VALUES
('AMP-1000', 'nurhasanah@gmail.com',        '2023-03-10 09:15:00'),
('AMP-1000', 'dewi.lestari@gmail.com',      '2023-06-22 14:30:00'),
('AMP-1000', 'tiara.anggraini@gmail.com',   '2024-01-15 10:00:00'),
('AMP-1000', 'nadia.safitri@gmail.com',     '2024-02-20 16:45:00'),
('AMP-3000', 'budi.santoso@gmail.com',      '2022-05-18 11:00:00'),
('AMP-3000', 'fitri.handayani@gmail.com',   '2023-09-05 13:20:00'),
('AMP-3000', 'ayu.maharani@gmail.com',      '2023-10-11 08:45:00'),
('AMP-3000', 'lina.oktavia@gmail.com',      '2024-03-30 15:10:00'),
('AMP-5000', 'ahmad.fauzi@yahoo.com',       '2022-08-07 10:30:00'),
('AMP-5000', 'kevin.tan@gmail.com',         '2022-12-25 19:00:00'),
('AMP-5000', 'andre.setiawan@gmail.com',    '2023-04-14 12:15:00'),
('AMP-5000', 'galih.saputra@gmail.com',     '2023-11-03 17:30:00'),
('AMP-10000', 'dr.hendra@gmail.com',        '2021-07-20 09:00:00'),
('AMP-10000', 'bambang.irawan@gmail.com',   '2022-02-14 11:30:00'),
('AMP-10000', 'rudi.hartono@gmail.com',     '2022-10-08 14:00:00'),
('AMP-10000', 'teguh.wibowo@gmail.com',     '2023-05-25 16:20:00'),
('AMP-25000', 'dr.anita@yahoo.com',         '2020-09-01 08:00:00'),
('AMP-25000', 'dr.baskoro@gmail.com',       '2021-03-17 10:45:00'),
('AMP-25000', 'sri.mulyani@gmail.com',      '2022-07-04 13:00:00'),
('AMP-25000', 'dr.arief@gmail.com',         '2023-08-19 15:30:00');

INSERT INTO claim_missing_miles (email_member, email_staf, maskapai, bandara_asal, bandara_tujuan, tanggal_penerbangan, flight_number, nomor_tiket, kelas_kabin, pnr, status_penerimaan, timestamp) VALUES
('budi.santoso@gmail.com',     'james.lee@gmail.com',        'GA', 'CGK', 'DPS', '2024-01-10', 'GA401',  'TKT20240110001', 'Economy',  'PNR10001', 'Disetujui', '2024-01-15 09:00:00'),
('dr.hendra@gmail.com',        'rachel.lim@gmail.com',       'GA', 'CGK', 'SIN', '2024-01-18', 'GA838',  'TKT20240118002', 'Business', 'PNR10002', 'Disetujui', '2024-01-22 10:30:00'),
('bambang.irawan@gmail.com',   'james.lee@gmail.com',        'GA', 'SUB', 'CGK', '2024-02-05', 'GA302',  'TKT20240205003', 'Economy',  'PNR10003', 'Disetujui', '2024-02-09 14:00:00'),
('dr.maya@yahoo.com',          'rachel.lim@gmail.com',       'GA', 'CGK', 'NRT', '2024-02-20', 'GA880',  'TKT20240220004', 'Business', 'PNR10004', 'Disetujui', '2024-02-25 11:15:00'),
('kevin.tan@gmail.com',        'andi.gunawan@gmail.com',     'JT', 'CGK', 'UPG', '2024-03-03', 'JT752',  'TKT20240303005', 'Economy',  'PNR10005', 'Disetujui', '2024-03-07 08:45:00'),
('teguh.wibowo@gmail.com',     'yeni.angkasa@gmail.com',     'JT', 'KNO', 'CGK', '2024-03-15', 'JT130',  'TKT20240315006', 'Economy',  'PNR10006', 'Disetujui', '2024-03-19 13:20:00'),
('dr.anita@yahoo.com',         'wahid.abdurrahman@gmail.com','QZ', 'CGK', 'KUL', '2024-04-01', 'QZ155',  'TKT20240401007', 'Economy',  'PNR10007', 'Disetujui', '2024-04-05 09:30:00'),
('sri.mulyani@gmail.com',      'dr.natalia@gmail.com',       'QZ', 'DPS', 'BKK', '2024-04-12', 'QZ276',  'TKT20240412008', 'Business', 'PNR10008', 'Disetujui', '2024-04-16 15:00:00'),
('siti.rahayu@gmail.com',      'dr.putri@gmail.com',         'GA', 'CGK', 'SUB', '2024-02-14', 'GA234',  'TKT20240214009', 'Economy',  'PNR10009', 'Ditolak',   '2024-02-18 10:00:00'),
('nurhasanah@gmail.com',       'dimas.ardiansyah@gmail.com', 'JT', 'CGK', 'BPN', '2024-03-08', 'JT544',  'TKT20240308010', 'Economy',  'PNR10010', 'Ditolak',   '2024-03-12 11:30:00'),
('lina.oktavia@gmail.com',     'helmi.syahputra@gmail.com',  'SJ', 'SUB', 'UPG', '2024-03-22', 'SJ568',  'TKT20240322011', 'Economy',  'PNR10011', 'Ditolak',   '2024-03-26 14:45:00'),
('ayu.maharani@gmail.com',     'ivan.christianto@gmail.com', 'ID', 'CGK', 'MDC', '2024-04-18', 'ID606',  'TKT20240418012', 'Economy',  'PNR10012', 'Ditolak',   '2024-04-22 09:15:00'),
('fajar.ramadhan@gmail.com',   'james.lee@gmail.com',        'GA', 'CGK', 'DPS', '2024-04-25', 'GA415',  'TKT20240425013', 'Economy',  'PNR10013', 'Ditolak',   '2024-04-29 16:00:00'),
('ahmad.fauzi@yahoo.com',      NULL, 'GA', 'CGK', 'SYD', '2024-05-10', 'GA716',  'TKT20240510014', 'Business', 'PNR10014', 'Menunggu',  '2024-05-14 08:00:00'),
('rudi.hartono@gmail.com',     NULL, 'JT', 'CGK', 'LOP', '2024-05-15', 'JT642',  'TKT20240515015', 'Economy',  'PNR10015', 'Menunggu',  '2024-05-18 10:20:00'),
('andre.setiawan@gmail.com',   NULL, 'JT', 'SUB', 'CGK', '2024-05-20', 'JT310',  'TKT20240520016', 'Economy',  'PNR10016', 'Menunggu',  '2024-05-23 13:00:00'),
('galih.saputra@gmail.com',    NULL, 'SJ', 'CGK', 'KNO', '2024-05-22', 'SJ014',  'TKT20240522017', 'Economy',  'PNR10017', 'Menunggu',  '2024-05-25 09:45:00'),
('haris.maulana@gmail.com',    NULL, 'ID', 'CGK', 'BPN', '2024-05-25', 'ID522',  'TKT20240525018', 'Economy',  'PNR10018', 'Menunggu',  '2024-05-28 11:10:00'),
('irfan.hakim@gmail.com',      NULL, 'QZ', 'CGK', 'KUL', '2024-05-28', 'QZ157',  'TKT20240528019', 'Economy',  'PNR10019', 'Menunggu',  '2024-05-31 14:30:00'),
('daniel.park@gmail.com',      NULL, 'GA', 'CGK', 'ICN', '2024-05-30', 'GA878',  'TKT20240530020', 'First',    'PNR10020', 'Menunggu',  '2024-06-02 08:30:00');

INSERT INTO transfer (email_member_1, email_member_2, timestamp, jumlah, catatan) VALUES
('budi.santoso@gmail.com',    'siti.rahayu@gmail.com',      '2023-02-14 10:00:00',  500,  'Hadiah ulang tahun'),
('dr.anita@yahoo.com',        'dr.sinta@gmail.com',         '2023-03-20 14:30:00', 5000,  'Transfer keluarga'),
('sri.mulyani@gmail.com',     'dr.arief@gmail.com',         '2023-05-05 09:15:00', 3000,  'Berbagi miles liburan'),
('bambang.irawan@gmail.com',  'andre.setiawan@gmail.com',   '2023-06-18 11:45:00', 2000,  'Transfer rekan kerja'),
('dr.baskoro@gmail.com',      'dr.wahyu@gmail.com',         '2023-07-10 16:00:00', 8000,  'Bantuan miles upgrade'),
('teguh.wibowo@gmail.com',    'haris.maulana@gmail.com',    '2023-08-25 13:20:00', 1500,  'Transfer teman'),
('dr.maya@yahoo.com',         'maria.susanti@gmail.com',    '2023-09-12 08:30:00', 4000,  'Kado pernikahan'),
('galih.saputra@gmail.com',   'fajar.ramadhan@gmail.com',   '2023-10-03 15:10:00', 1000,  'Bantu tiket pulang'),
('kevin.tan@gmail.com',       'lisa.wong@gmail.com',        '2023-11-07 10:45:00', 2500,  'Transfer antar teman'),
('rudi.hartono@gmail.com',    'eko.prasetyo@gmail.com',     '2023-12-01 14:00:00', 1800,  'Patungan miles'),
('dr.arief@gmail.com',        'dr.anita@yahoo.com',         '2024-01-14 09:00:00', 6000,  'Balik transfer liburan'),
('sophia.chen@gmail.com',     'tony.nguyen@gmail.com',      '2024-02-08 11:30:00', 3500,  'Transfer sesama ekspatriat'),
('dodi.hermawan@gmail.com',   'ratna.dewi@gmail.com',       '2024-03-19 16:45:00', 2200,  'Transfer pasangan'),
('agus.kurniawan@gmail.com',  'irfan.hakim@gmail.com',      '2024-04-22 13:15:00',  800,  'Bantu miles teman'),
('daniel.park@gmail.com',     'michiko.tanaka@gmail.com',   '2024-05-30 10:00:00', 4500,  'Transfer sesama member Asia');

INSERT INTO hadiah (kode_hadiah, nama, miles, deskripsi, valid_start_date, program_end, id_penyedia) VALUES
('HDH-GA01',  'Upgrade Kelas Bisnis Garuda',          15000, 'Upgrade satu kali penerbangan ke kelas bisnis Garuda Indonesia',          '2024-01-01', '2024-12-31', 1),
('HDH-GA02',  'Diskon 20% Tiket Garuda',               8000, 'Voucher diskon 20% untuk pembelian tiket Garuda Indonesia',               '2024-01-01', '2024-12-31', 1),
('HDH-JT01',  'Tiket Gratis Lion Air Domestik',        12000, 'Satu tiket gratis rute domestik Lion Air kelas ekonomi',                  '2024-01-01', '2024-12-31', 2),
('HDH-QZ01',  'Tiket Gratis AirAsia Rute ASEAN',       10000, 'Satu tiket gratis rute ASEAN AirAsia Indonesia',                         '2024-03-01', '2024-12-31', 3),
('HDH-SJ01',  'Diskon 15% Tiket Sriwijaya Air',         5000, 'Voucher diskon 15% untuk pembelian tiket Sriwijaya Air',                  '2024-01-01', '2024-09-30', 4),
('HDH-HM01',  'Menginap 1 Malam Hotel Mulia',          20000, 'Gratis menginap satu malam di Hotel Mulia Jakarta (kamar Deluxe)',        '2024-01-01', '2024-12-31', 6),
('HDH-TV01',  'Voucher Traveloka Rp200.000',            6000, 'Voucher Traveloka senilai Rp200.000 untuk pemesanan hotel atau tiket',    '2024-02-01', '2024-12-31', 7),
('HDH-HZ01',  'Sewa Mobil Hertz 1 Hari',               9000, 'Gratis sewa mobil Hertz Indonesia selama satu hari (maks. 200 km)',       '2024-01-01', '2024-10-31', 8),
('HDH-TK01',  'Voucher Tiket.com Rp150.000',            4000, 'Voucher Tiket.com senilai Rp150.000 untuk pemesanan wisata atau hotel',   '2024-03-01', '2024-12-31', 9),
('HDH-BB01',  'Voucher Taksi Blue Bird 5 Perjalanan',   3000, 'Voucher gratis 5 perjalanan taksi Blue Bird maksimal Rp80.000 per trip',  '2024-01-01', '2024-12-31', 10);

INSERT INTO redeem (email_member, kode_hadiah, timestamp) VALUES
('dr.anita@yahoo.com',         'HDH-GA01',  '2024-01-20 10:00:00'),
('dr.baskoro@gmail.com',       'HDH-GA01',  '2024-02-05 14:30:00'),
('sri.mulyani@gmail.com',      'HDH-GA02',  '2024-01-25 09:15:00'),
('dr.sinta@gmail.com',         'HDH-GA02',  '2024-03-10 11:00:00'),
('dr.arief@gmail.com',         'HDH-JT01',  '2024-02-14 13:45:00'),
('dr.maya@yahoo.com',          'HDH-JT01',  '2024-03-22 16:20:00'),
('yusuf.pratama@gmail.com',    'HDH-QZ01',  '2024-04-01 08:30:00'),
('maria.susanti@gmail.com',    'HDH-QZ01',  '2024-04-15 10:15:00'),
('bambang.irawan@gmail.com',   'HDH-SJ01',  '2024-02-28 15:00:00'),
('teguh.wibowo@gmail.com',     'HDH-SJ01',  '2024-04-20 09:45:00'),
('dr.wahyu@gmail.com',         'HDH-HM01',  '2024-01-30 12:00:00'),
('ratna.dewi@gmail.com',       'HDH-HM01',  '2024-03-05 14:00:00'),
('dr.hendra@gmail.com',        'HDH-TV01',  '2024-02-10 10:30:00'),
('rudi.hartono@gmail.com',     'HDH-TV01',  '2024-04-08 11:45:00'),
('galih.saputra@gmail.com',    'HDH-HZ01',  '2024-03-18 13:00:00'),
('dodi.hermawan@gmail.com',    'HDH-HZ01',  '2024-05-02 09:00:00'),
('agus.kurniawan@gmail.com',   'HDH-TK01',  '2024-03-25 15:30:00'),
('fajar.ramadhan@gmail.com',   'HDH-TK01',  '2024-04-30 10:00:00'),
('kevin.tan@gmail.com',        'HDH-BB01',  '2024-04-10 08:15:00'),
('andre.setiawan@gmail.com',   'HDH-BB01',  '2024-05-15 16:00:00');