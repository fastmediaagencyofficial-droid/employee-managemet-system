-- Check if admin@company.com has an employee record
SELECT 
    u.id as user_id,
    u.email,
    u.role,
    e.id as employee_id,
    e."employeeId",
    e."firstName",
    e."lastName"
FROM "User" u
LEFT JOIN "Employee" e ON e."userId" = u.id
WHERE u.email = 'admin@company.com';

-- If the above returns NULL for employee fields, run this to create an employee record for admin:
-- INSERT INTO "Employee" (
--     id,
--     "userId",
--     "employeeId",
--     "firstName",
--     "lastName",
--     email,
--     position,
--     "departmentId",
--     salary,
--     "hireDate",
--     "employmentType",
--     status,
--     "createdAt",
--     "updatedAt"
-- )
-- SELECT 
--     gen_random_uuid(),
--     u.id,
--     'EMP000',
--     'Admin',
--     'User',
--     'admin@company.com',
--     'System Administrator',
--     (SELECT id FROM "Department" LIMIT 1),
--     0,
--     CURRENT_DATE,
--     'FULL_TIME',
--     'ACTIVE',
--     CURRENT_TIMESTAMP,
--     CURRENT_TIMESTAMP
-- FROM "User" u
-- WHERE u.email = 'admin@company.com'
-- AND NOT EXISTS (SELECT 1 FROM "Employee" WHERE "userId" = u.id);

-- Check all tasks
SELECT 
    t.id,
    t.title,
    t.status,
    t."assignedToId",
    e."employeeId",
    e."firstName" || ' ' || e."lastName" as assigned_to_name
FROM "Task" t
LEFT JOIN "Employee" e ON t."assignedToId" = e.id
ORDER BY t."createdAt" DESC;
