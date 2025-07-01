-- Create admin account for Iwanyu store
-- Email: admin@iwanyu.store
-- Password: Admin$100 (will be hashed)

-- Note: The password hash below is for 'Admin$100' using bcrypt with salt rounds 12
-- You may need to regenerate this hash if using a different bcrypt implementation

INSERT INTO users (
  id,
  email,
  password,
  "firstName",
  "lastName",
  role,
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@iwanyu.store',
  '$2a$12$LQv3c1yqBWVHxkd0LQ4YNu.VQVrQDChvwFXuKZHvQjHQxjZZHxKyW', -- This is the hash for 'Admin$100'
  'Admin',
  'User',
  'ADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Verify the admin account was created
SELECT id, email, "firstName", "lastName", role, "isActive", "createdAt" 
FROM users 
WHERE email = 'admin@iwanyu.store';
