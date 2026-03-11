import { PrismaClient, Role, Gender, EmploymentType, EmploymentStatus, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding for FastMedia Production...');

    // 1. Create Departments
    console.log('Creating departments...');
    const executive = await prisma.department.upsert({
        where: { name: 'Executive' },
        update: {},
        create: {
            name: 'Executive',
            description: 'Executive Management',
        },
    });

    const hr = await prisma.department.upsert({
        where: { name: 'Human Resources' },
        update: {},
        create: {
            name: 'Human Resources',
            description: 'HR Management',
        },
    });

    console.log('✅ Departments created');

    // 2. Create Users with Exact Encrypted Passwords
    const fastmediaPw = '$2b$12$QXk.KSftPsnwrycj6oTLl.TM/UbWf3YaTYQqle782xbvlau5l5y2m';
    const xfastgroupPw = '$2b$12$60Mxsy18qpXYcqkyWlalXOzidLANVQjileBLpmPK14wBenFQzSq.S';
    const hafsaPw = '$2b$12$sCtAejfSdF/h03wTGyLWbeOC1QJVdaXjeiCUp6Js7y5H5CC.Eojti';

    console.log('Creating FastMedia Admins...');

    // Super Admin (CEO)
    const superAdmin = await prisma.user.upsert({
        where: { email: 'fastmediaagencyofficial@gmail.com' },
        update: { password: fastmediaPw },
        create: {
            email: 'fastmediaagencyofficial@gmail.com',
            password: fastmediaPw,
            name: 'Super Admin',
            role: Role.ADMIN,
            emailVerified: new Date(),
        },
    });

    await prisma.employee.upsert({
        where: { userId: superAdmin.id },
        update: {},
        create: {
            userId: superAdmin.id,
            employeeId: 'EMP001',
            firstName: 'Super',
            lastName: 'Admin',
            email: 'fastmediaagencyofficial@gmail.com',
            position: 'CEO',
            departmentId: executive.id,
            hireDate: new Date(),
            employmentType: EmploymentType.FULL_TIME,
            status: EmploymentStatus.ACTIVE,
        },
    });

    // Administrator
    const adminUser = await prisma.user.upsert({
        where: { email: 'xfastgroup001@gmail.com' },
        update: { password: xfastgroupPw },
        create: {
            email: 'xfastgroup001@gmail.com',
            password: xfastgroupPw,
            name: 'Admin User',
            role: Role.ADMIN,
            emailVerified: new Date(),
        },
    });

    await prisma.employee.upsert({
        where: { userId: adminUser.id },
        update: {},
        create: {
            userId: adminUser.id,
            employeeId: 'EMP002',
            firstName: 'Admin',
            lastName: 'User',
            email: 'xfastgroup001@gmail.com',
            position: 'Administrator',
            departmentId: executive.id,
            hireDate: new Date(),
            employmentType: EmploymentType.FULL_TIME,
            status: EmploymentStatus.ACTIVE,
        },
    });

    // HR Manager
    const hrManager = await prisma.user.upsert({
        where: { email: 'hafsaakbar071@gmail.com' },
        update: { password: hafsaPw },
        create: {
            email: 'hafsaakbar071@gmail.com',
            password: hafsaPw,
            name: 'Hafsa Akbar',
            role: Role.HR,
            emailVerified: new Date(),
        },
    });

    await prisma.employee.upsert({
        where: { userId: hrManager.id },
        update: {},
        create: {
            userId: hrManager.id,
            employeeId: 'EMP003',
            firstName: 'Hafsa',
            lastName: 'Akbar',
            email: 'hafsaakbar071@gmail.com',
            position: 'HR Manager',
            departmentId: hr.id,
            hireDate: new Date(),
            employmentType: EmploymentType.FULL_TIME,
            status: EmploymentStatus.ACTIVE,
        },
    });

    console.log('✅ Real FastMedia users created/updated with their original passwords!');
    console.log('\n📝 Seeded Accounts:');
    console.log('1. fastmediaagencyofficial@gmail.com (Super Admin / CEO)');
    console.log('2. xfastgroup001@gmail.com (Admin)');
    console.log('3. hafsaakbar071@gmail.com (HR Manager)');
    console.log('\n(Passwords are securely maintained from previous system)');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
