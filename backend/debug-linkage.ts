
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- LINKAGE DIAGNOSTIC START ---');

    const users = await prisma.user.findMany();
    const employees = await prisma.employee.findMany();

    console.log(`Users: ${users.length}, Employees: ${employees.length}`);

    console.log('\n--- USERS with "hamza" or "anas" ---');
    const targetUsers = users.filter(u => u.email.includes('hamza') || u.email.includes('anas') || (u.name && (u.name.toLowerCase().includes('hamza') || u.name.toLowerCase().includes('anas'))));
    targetUsers.forEach(u => {
        console.log(`User: ${u.email} (ID: ${u.id})`);
    });

    console.log('\n--- EMPLOYEES with "hamza" or "anas" ---');
    const targetEmployees = employees.filter(e => e.firstName.toLowerCase().includes('hamza') || e.lastName.toLowerCase().includes('hamza') || e.email.includes('hamza') || e.firstName.toLowerCase().includes('anas') || e.lastName.toLowerCase().includes('anas'));
    targetEmployees.forEach(e => {
        console.log(`Employee: ${e.firstName} ${e.lastName} (ID: ${e.id}, UserID: ${e.userId}, Email: ${e.email})`);
    });

    console.log('\n--- MATCH CHECK ---');
    targetEmployees.forEach(e => {
        const user = users.find(u => u.id === e.userId);
        if (user) {
            console.log(`Employee ${e.firstName} matches User ${user.email}`);
        } else {
            console.log(`Employee ${e.firstName} (UserID: ${e.userId}) DOES NOT MATCH ANY USER!`);
        }
    });

    targetUsers.forEach(u => {
        const emp = employees.find(e => e.userId === u.id);
        if (emp) {
            console.log(`User ${u.email} matches Employee ${emp.firstName}`);
        } else {
            console.log(`User ${u.email} (ID: ${u.id}) HAS NO LINKED EMPLOYEE!`);
        }
    });

    console.log('--- LINKAGE DIAGNOSTIC END ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
