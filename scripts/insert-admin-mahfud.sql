-- Insert admin account baru
-- Email: mahfud@yopmail.com
-- Password: password123

-- Hapus akun lama jika ada
DELETE FROM admin_accounts WHERE email = 'mahfud@yopmail.com';

-- Insert akun admin baru
INSERT INTO admin_accounts (email, password_hash, name, role, is_active) 
VALUES (
  'mahfud@yopmail.com', 
  '$2b$10$rOzJqQZQXQXQXQXQXQXQXu7VqQZQXQXQXQXQXQXQXQXQXQXQXQXQXQ', -- Placeholder, akan diganti dengan hash yang benar
  'Mahfud Admin', 
  'admin', 
  true
);

-- Verify insert
SELECT id, email, name, role, is_active, created_at 
FROM admin_accounts 
WHERE email = 'mahfud@yopmail.com';
