-- Run this query in your PostgreSQL database to see the mismatch

-- 1. Check current user and their employee record
SELECT 
    u.id as user_id, 
    u.email, 
    u.role,
    e.id as employee_uuid_id,
    e."employeeId" as employee_string_id,
    e."firstName",
    e."lastName"
FROM "User" u
LEFT JOIN "Employee" e ON e."userId" = u.id
WHERE u.email = 'YOUR_EMAIL_HERE'  -- Replace with your login email
LIMIT 1;

-- 2. Check all tasks and who they're assigned to
SELECT 
    t.id as task_id,
    t.title,
    t.status,
    t."assignedToId" as assigned_to_uuid,
    assigned_to."employeeId" as assigned_to_emp_id,
    assigned_to."firstName" || ' ' || assigned_to."lastName" as assigned_to_name,
    t."assignedById" as assigned_by_uuid,
    assigned_by."employeeId" as assigned_by_emp_id,
    assigned_by."firstName" || ' ' || assigned_by."lastName" as assigned_by_name
FROM "Task" t
LEFT JOIN "Employee" assigned_to ON t."assignedToId" = assigned_to.id
LEFT JOIN "Employee" assigned_by ON t."assignedById" = assigned_by.id
ORDER BY t."createdAt" DESC;

-- 3. Check if there's a mismatch
-- This will show if tasks are assigned to an employee UUID that doesn't match your user's employee UUID
SELECT 
    'User Employee ID' as type,
    e.id as employee_uuid
FROM "User" u
JOIN "Employee" e ON e."userId" = u.id
WHERE u.email = 'YOUR_EMAIL_HERE'  -- Replace with your login email

UNION ALL

SELECT 
    'Task Assigned To ID' as type,
    t."assignedToId" as employee_uuid
FROM "Task" t
LIMIT 10;
