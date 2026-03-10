
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'hamza@gmail.com';
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log('User not found!');
        return;
    }

    // Check if employee exists
    const existingEmp = await prisma.employee.findUnique({ where: { userId: user.id } });
    if (existingEmp) {
        console.log('Employee already exists:', existingEmp.id);
        return;
    }

    // Generate ID
    const employeeCount = await prisma.employee.count();
    const employeeId = `EMP${String(employeeCount + 1).padStart(4, '0')}`;

    // Create employee
    const names = (user.name || 'Hamza User').split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || 'User';

    const newEmp = await prisma.employee.create({
        data: {
            userId: user.id,
            employeeId,
            firstName,
            lastName,
            email: user.email,
            position: 'Developer',
            departmentId: 'cmlmmtlxq0000sup0bfzeyr7z', // Engineering
            hireDate: new Date(),
            employmentType: 'FULL_TIME',
            status: 'ACTIVE'
        }
    });

    console.log(`Created Employee: ${newEmp.firstName} ${newEmp.lastName} (ID: ${newEmp.id}, EmpID: ${newEmp.employeeId})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
