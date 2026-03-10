import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/utils/bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Function to generate strong password
const generateStrongPassword = (length = 16) => {
    return crypto.randomBytes(length).toString('base64').slice(0, length) + '!@#';
};

async function main() {
    console.log('🚀 Starting production seeding...');

    // 1. Clean existing data
    console.log('🧹 Cleaning database...');
    // Delete in order to avoid foreign key constraints
    await prisma.notification.deleteMany();
    await prisma.taskComment.deleteMany();
    await prisma.taskAttachment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.leaveRequest.deleteMany();
    await prisma.performance.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.review.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.employeeDocument.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.user.deleteMany();
    await prisma.department.deleteMany();

    console.log('✅ Database cleared.');

    // 2. Create Departments (Basic setup)
    console.log('Building departments...');
    const depts = [
        { name: 'Executive', description: 'Executive Management' },
        { name: 'Human Resources', description: 'HR Management' },
        { name: 'Engineering', description: 'Software Development' },
        { name: 'Marketing', description: 'Marketing & Sales' },
        { name: 'Finance', description: 'Financial Operations' }
    ];

    const departmentMap = new Map();
    for (const dept of depts) {
        const d = await prisma.department.create({ data: dept });
        departmentMap.set(dept.name, d.id);
    }

    // 3. Define Accounts with FIXED Credentials
    const accounts = [
        {
            email: 'fastmediaagencyofficial@gmail.com',
            name: 'Super Admin',
            role: 'ADMIN' as Role,
            dept: 'Executive',
            position: 'CEO',
            password: 'KAKKEZg6HpbruJHU!@#'
        },
        {
            email: 'xfastgroup001@gmail.com',
            name: 'Admin User',
            role: 'ADMIN' as Role,
            dept: 'Executive',
            position: 'Administrator',
            password: 'LCZlBkIxDkmLjflv!@#'
        },
        {
            email: 'hafsaakbar071@gmail.com',
            name: 'Hafsa Akbar',
            role: 'HR' as Role,
            dept: 'Human Resources',
            position: 'HR Manager',
            password: 'dA/bm1BIW5ZXUWjn!@#'
        }
    ];

    console.log('\n🔐 CREDENTIALS (FIXED):');
    console.log('================================================================');

    for (const acc of accounts) {
        // Use fixed password instead of random
        const hashedPassword = await hashPassword(acc.password);

        // Create User
        const user = await prisma.user.create({
            data: {
                email: acc.email,
                name: acc.name,
                password: hashedPassword,
                role: acc.role,
                emailVerified: new Date(),
            }
        });

        // Create Employee Profile
        const employeeId = `EMP${crypto.randomInt(1000, 9999)}`;
        await prisma.employee.create({
            data: {
                userId: user.id,
                employeeId: employeeId,
                firstName: acc.name.split(' ')[0],
                lastName: acc.name.split(' ').slice(1).join(' ') || 'Admin',
                email: acc.email,
                position: acc.position,
                departmentId: departmentMap.get(acc.dept),
                hireDate: new Date(),
                employmentType: 'FULL_TIME',
                status: 'ACTIVE',
                salary: 0,
            }
        });

        console.log(`
        User: ${acc.name} (${acc.role})
        Email: ${acc.email}
        Password: ${acc.password}
        `);
    }
    console.log('================================================================');
    console.log('✅ Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
