const bcrypt = require('bcrypt');
const fs = require('fs');

async function main() {
    const h1 = await bcrypt.hash('KAKKEZg6HpbruJHU!@#', 12);
    const h2 = await bcrypt.hash('LCZlBkIxDkmLjflv!@#', 12);
    const h3 = await bcrypt.hash('dA/bm1BIW5ZXUWjn!@#', 12);

    const sql = `-- Run this in Supabase SQL Editor to set correct passwords and create employee profiles

-- 1. Update passwords
UPDATE users SET password = '${h1}', "emailVerified" = NOW(), "updatedAt" = NOW() WHERE email = 'fastmediaagencyofficial@gmail.com';
UPDATE users SET password = '${h2}', "emailVerified" = NOW(), "updatedAt" = NOW() WHERE email = 'xfastgroup001@gmail.com';
UPDATE users SET password = '${h3}', "emailVerified" = NOW(), "updatedAt" = NOW() WHERE email = 'hafsaakbar071@gmail.com';

-- 2. Create departments if not exist
INSERT INTO departments (id, name, description, "createdAt", "updatedAt")
VALUES
  ('dept-executive', 'Executive', 'Executive Management', NOW(), NOW()),
  ('dept-hr', 'Human Resources', 'HR Management', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 3. Create employee profiles for the 3 admin users
INSERT INTO employees (id, "userId", "employeeId", "firstName", "lastName", email, position, "departmentId", "hireDate", "employmentType", status, "createdAt", "updatedAt")
SELECT
  'emp-' || gen_random_uuid()::text,
  u.id,
  'EMP001',
  'Super',
  'Admin',
  'fastmediaagencyofficial@gmail.com',
  'CEO',
  'dept-executive',
  NOW(),
  'FULL_TIME',
  'ACTIVE',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'fastmediaagencyofficial@gmail.com'
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO employees (id, "userId", "employeeId", "firstName", "lastName", email, position, "departmentId", "hireDate", "employmentType", status, "createdAt", "updatedAt")
SELECT
  'emp-' || gen_random_uuid()::text,
  u.id,
  'EMP002',
  'Admin',
  'User',
  'xfastgroup001@gmail.com',
  'Administrator',
  'dept-executive',
  NOW(),
  'FULL_TIME',
  'ACTIVE',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'xfastgroup001@gmail.com'
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO employees (id, "userId", "employeeId", "firstName", "lastName", email, position, "departmentId", "hireDate", "employmentType", status, "createdAt", "updatedAt")
SELECT
  'emp-' || gen_random_uuid()::text,
  u.id,
  'EMP003',
  'Hafsa',
  'Akbar',
  'hafsaakbar071@gmail.com',
  'HR Manager',
  'dept-hr',
  NOW(),
  'FULL_TIME',
  'ACTIVE',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'hafsaakbar071@gmail.com'
ON CONFLICT ("userId") DO NOTHING;

SELECT email, role, "emailVerified" FROM users WHERE email IN ('fastmediaagencyofficial@gmail.com','xfastgroup001@gmail.com','hafsaakbar071@gmail.com');
`;

    fs.writeFileSync('prisma/setup-users.sql', sql, 'utf8');
    console.log('Done! SQL written to prisma/setup-users.sql');
}

main().catch(console.error);
