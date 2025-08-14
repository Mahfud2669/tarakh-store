-- Manual insert dengan hash yang sudah digenerate
-- Jalankan script create-admin-hash.js dulu untuk mendapatkan hash yang benar

-- Hapus akun lama jika ada
DELETE FROM admin_accounts WHERE email = 'mahfud@yopmail.com';

-- Insert akun baru (ganti HASH_DARI_SCRIPT dengan hasil dari create-admin-hash.js)
INSERT INTO admin_accounts (email, password_hash, name, role, is_active) 
VALUES (
  'mahfud@yopmail.com', 
  'HASH_DARI_SCRIPT', -- Ganti dengan hash dari script
  'Mahfud Admin', 
  'admin', 
  true
);

-- Verify insert berhasil
SELECT 
  id, 
  email, 
  name, 
  role, 
  is_active,
  LENGTH(password_hash) as hash_length,
  SUBSTRING(password_hash, 1, 10) as hash_preview
FROM admin_accounts 
WHERE email = 'mahfud@yopmail.com';
