
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DIAGNOSTIC START ---');

    // 1. Get all Users
    const users = await prisma.user.findMany({
        include: {
            employee: true
        }
    });
    console.log(`Total Users: ${users.length}`);

    // 2. Get all Employees
    const employees = await prisma.employee.findMany({
        include: {
            user: true,
            assignedTasks: true
        }
    });
    console.log(`Total Employees: ${employees.length}`);

    // 3. Get all Tasks
    const tasks = await prisma.task.findMany({
        include: {
            assignedTo: true
        }
    });
    console.log(`Total Tasks: ${tasks.length}`);

    console.log('\n--- MAPPING CHECK ---');
    for (const user of users) {
        console.log(`User: ${user.email} (Role: ${user.role}, ID: ${user.id})`);
        if (user.employee) {
            console.log(`  -> Linked Employee: ${user.employee.firstName} ${user.employee.lastName} (ID: ${user.employee.id}, EmployeeID: ${user.employee.employeeId})`);

            const userTasks = tasks.filter(t => t.assignedToId === user.employee?.id);
            console.log(`  -> Tasks assigned to this employee ID (${user.employee.id}): ${userTasks.length}`);
            userTasks.forEach(t => {
                console.log(`     - Task: "${t.title}" (Status: ${t.status}, AssignedToId: ${t.assignedToId})`);
            });
        } else {
            console.log(`  -> NO LINKED EMPLOYEE`);
        }
    }

    console.log('\n--- ORPHANED TASKS CHECK ---');
    const employeeIds = employees.map(e => e.id);
    const orphanedTasks = tasks.filter(t => !employeeIds.includes(t.assignedToId));
    if (orphanedTasks.length > 0) {
        console.log(`Found ${orphanedTasks.length} orphaned tasks (assigned to non-existent employees):`);
        orphanedTasks.forEach(t => {
            console.log(`  - Task: "${t.title}" (AssignedToId: ${t.assignedToId})`);
        });
    } else {
        console.log('No orphaned tasks found.');
    }

    console.log('--- DIAGNOSTIC END ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
