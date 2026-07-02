-- Insert admin account baru
-- Email: mahfud@yopmail.com
-- Password: 123456

-- Hapus akun lama jika ada
DELETE FROM admin_accounts WHERE email = 'mahfud@yopmail.com';

-- Insert akun admin baru dengan password yang sudah di-hash
-- Hash untuk password 123456 dengan bcrypt:
INSERT INTO admin_accounts (email, password_hash, name, role, is_active, created_at, updated_at) 
VALUES (
  'mahfud@yopmail.com', 
  '$2a$10$TiWvvNCZIRf..v59OZpPAO3V/KNu5qfEVMD7Gl.cE4cVTdO7mIpoi',
  'Mahfud Admin', 
  'admin', 
  true,
  NOW(),
  NOW()
);

-- Verify insert
SELECT id, email, name, role, is_active, created_at 
FROM admin_accounts 
WHERE email = 'mahfud@yopmail.com';
