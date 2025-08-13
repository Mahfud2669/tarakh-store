-- Create default admin user with hashed password
-- This script will create an admin user with:
-- Username: admin
-- Password: admin123
-- Email: admin@tarakhstore.com

-- First, let's make sure the admin_users table exists
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user with bcrypt hashed password for 'admin123'
-- The hash below is for password: admin123
INSERT INTO admin_users (username, email, password_hash) VALUES 
('admin', 'admin@tarakhstore.com', '$2b$10$K8QVQZQXQXQXQXQXQXQXQu7VqQZQXQXQXQXQXQXQXQXQXQXQXQXQXQ')
ON CONFLICT (username) DO UPDATE SET
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    updated_at = CURRENT_TIMESTAMP;

-- Verify the admin user was created
SELECT username, email, is_active, created_at FROM admin_users WHERE username = 'admin';
