
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- CREATING TEST TASK ---');

    // 1. Find Hamza's Employee Record
    const emp = await prisma.employee.findFirst({
        where: { email: 'hamza@gmail.com' }
    });

    if (!emp) {
        console.error('Hamza employee record not found!');
        return;
    }
    console.log(`Found Employee: ${emp.firstName} (ID: ${emp.id})`);

    // 2. Find Admin to be the assigner
    const adminEmp = await prisma.employee.findFirst({
        where: { user: { role: 'ADMIN' } }
    });

    // If no admin employee, just use Hamza as assigner for test or find any employee
    const assignerId = adminEmp ? adminEmp.id : emp.id;
    console.log(`Assigner ID: ${assignerId}`);

    // 3. Create Task
    const task = await prisma.task.create({
        data: {
            title: 'Verify My Tasks Visibility',
            description: 'This is a test task to verify it appears in My Tasks.',
            priority: 'HIGH',
            status: 'PENDING',
            assignedToId: emp.id,
            assignedById: assignerId,
            dueDate: new Date(Date.now() + 86400000) // Tomorrow
        }
    });

    console.log(`Task Created: "${task.title}" (ID: ${task.id})`);
    console.log(`Assigned To: ${task.assignedToId}`);

    // 4. Verify Fetch
    console.log('\n--- VERIFYING FETCH ---');
    const myTasks = await prisma.task.findMany({
        where: { assignedToId: emp.id }
    });

    console.log(`Tasks found for Hamza: ${myTasks.length}`);
    myTasks.forEach(t => console.log(`- ${t.title}`));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
