-- Check if user has an employee record
SELECT u.id as user_id, u.email, u.role, e.id as employee_id, e."employeeId", e."firstName", e."lastName"
FROM "User" u
LEFT JOIN "Employee" e ON e."userId" = u.id
ORDER BY u."createdAt" DESC
LIMIT 10;

-- Check all tasks in the database
SELECT t.id, t.title, t.status, t.priority,
       assigned_to.id as assigned_to_id, assigned_to."employeeId" as assigned_to_emp_id, assigned_to."firstName" || ' ' || assigned_to."lastName" as assigned_to_name,
       assigned_by.id as assigned_by_id, assigned_by."employeeId" as assigned_by_emp_id, assigned_by."firstName" || ' ' || assigned_by."lastName" as assigned_by_name
FROM "Task" t
LEFT JOIN "Employee" assigned_to ON t."assignedToId" = assigned_to.id
LEFT JOIN "Employee" assigned_by ON t."assignedById" = assigned_by.id
ORDER BY t."createdAt" DESC;
