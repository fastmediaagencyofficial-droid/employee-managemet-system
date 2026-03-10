import { PrismaClient, Role, Gender, EmploymentType, EmploymentStatus, AttendanceStatus, GoalStatus, GoalCategory, GoalType, Priority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Create Departments
    console.log('Creating departments...');
    const engineering = await prisma.department.upsert({
        where: { name: 'Engineering' },
        update: {},
        create: {
            name: 'Engineering',
            description: 'Software development and engineering team',
        },
    });

    const hr = await prisma.department.upsert({
        where: { name: 'Human Resources' },
        update: {},
        create: {
            name: 'Human Resources',
            description: 'HR and people operations',
        },
    });

    const sales = await prisma.department.upsert({
        where: { name: 'Sales' },
        update: {},
        create: {
            name: 'Sales',
            description: 'Sales and business development',
        },
    });

    const marketing = await prisma.department.upsert({
        where: { name: 'Marketing' },
        update: {},
        create: {
            name: 'Marketing',
            description: 'Marketing and brand management',
        },
    });

    console.log('✅ Departments created');

    // Hash password for all demo users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create Admin User & Employee
    console.log('Creating admin user...');
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@company.com' },
        update: {},
        create: {
            email: 'admin@company.com',
            password: hashedPassword,
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
            employeeId: 'EMP001',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@company.com',
            phone: '+1234567890',
            gender: Gender.MALE,
            position: 'System Administrator',
            departmentId: engineering.id,
            hireDate: new Date('2020-01-01'),
            employmentType: EmploymentType.FULL_TIME,
            status: EmploymentStatus.ACTIVE,
        },
    });

    console.log('✅ Admin user created');

    // Create HR User & Employee
    console.log('Creating HR user...');
    const hrUser = await prisma.user.upsert({
        where: { email: 'hr@company.com' },
        update: {},
        create: {
            email: 'hr@company.com',
            password: hashedPassword,
            name: 'Sarah Johnson',
            role: Role.HR,
            emailVerified: new Date(),
        },
    });

    await prisma.employee.upsert({
        where: { userId: hrUser.id },
        update: {},
        create: {
            userId: hrUser.id,
            employeeId: 'EMP002',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'hr@company.com',
            phone: '+1234567891',
            gender: Gender.FEMALE,
            position: 'HR Manager',
            departmentId: hr.id,
            hireDate: new Date('2020-03-15'),
            employmentType: EmploymentType.FULL_TIME,
            status: EmploymentStatus.ACTIVE,
        },
    });

    console.log('✅ HR user created');

    // Create Manager User & Employee
    console.log('Creating manager user...');
    const managerUser = await prisma.user.upsert({
        where: { email: 'manager@company.com' },
        update: {},
        create: {
            email: 'manager@company.com',
            password: hashedPassword,
            name: 'John Smith',
            role: Role.MANAGER,
            emailVerified: new Date(),
        },
    });

    const managerEmployee = await prisma.employee.upsert({
        where: { userId: managerUser.id },
        update: {},
        create: {
            userId: managerUser.id,
            employeeId: 'EMP003',
            firstName: 'John',
            lastName: 'Smith',
            email: 'manager@company.com',
            phone: '+1234567892',
            gender: Gender.MALE,
            position: 'Engineering Manager',
            departmentId: engineering.id,
            hireDate: new Date('2019-06-01'),
            employmentType: EmploymentType.FULL_TIME,
            status: EmploymentStatus.ACTIVE,
        },
    });

    console.log('✅ Manager user created');

    // Create Regular Employees
    console.log('Creating regular employees...');

    const employee1User = await prisma.user.upsert({
        where: { email: 'employee@company.com' },
        update: {},
        create: {
            email: 'employee@company.com',
            password: hashedPassword,
            name: 'Jane Doe',
            role: Role.EMPLOYEE,
            emailVerified: new Date(),
        },
    });

    const employee1 = await prisma.employee.upsert({
        where: { userId: employee1User.id },
        update: {},
        create: {
            userId: employee1User.id,
            employeeId: 'EMP004',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'employee@company.com',
            phone: '+1234567893',
            gender: Gender.FEMALE,
            position: 'Software Engineer',
            departmentId: engineering.id,
            managerId: managerEmployee.id,
            hireDate: new Date('2021-09-01'),
            employmentType: EmploymentType.FULL_TIME,
            status: EmploymentStatus.ACTIVE,
        },
    });

    // Additional employees
    const employeesData = [
        { firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@company.com', position: 'Senior Developer', department: engineering.id, managerId: managerEmployee.id },
        { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@company.com', position: 'Sales Representative', department: sales.id },
        { firstName: 'David', lastName: 'Wilson', email: 'david.wilson@company.com', position: 'Marketing Specialist', department: marketing.id },
        { firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.anderson@company.com', position: 'Backend Developer', department: engineering.id, managerId: managerEmployee.id },
        { firstName: 'Robert', lastName: 'Taylor', email: 'robert.taylor@company.com', position: 'UX Designer', department: engineering.id, managerId: managerEmployee.id },
        { firstName: 'Jennifer', lastName: 'Martinez', email: 'jennifer.martinez@company.com', position: 'Sales Manager', department: sales.id },
    ];

    let empNum = 5;
    for (const emp of employeesData) {
        const user = await prisma.user.upsert({
            where: { email: emp.email },
            update: {},
            create: {
                email: emp.email,
                password: hashedPassword,
                name: `${emp.firstName} ${emp.lastName}`,
                role: Role.EMPLOYEE,
                emailVerified: new Date(),
            },
        });

        await prisma.employee.upsert({
            where: { email: emp.email },
            update: {},
            create: {
                userId: user.id,
                employeeId: `EMP${String(empNum).padStart(3, '0')}`,
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
                phone: `+123456789${empNum}`,
                gender: empNum % 2 === 0 ? Gender.MALE : Gender.FEMALE,
                position: emp.position,
                departmentId: emp.department,
                managerId: emp.managerId || null,
                hireDate: new Date(2021, Math.floor(Math.random() * 12), 1),
                employmentType: EmploymentType.FULL_TIME,
                status: EmploymentStatus.ACTIVE,
            },
        });
        empNum++;
    }

    console.log('✅ Employees created');

    // Create sample goals for employee1
    console.log('Creating sample goals...');
    await prisma.goal.create({
        data: {
            employeeId: employee1.id,
            title: 'Complete React Advanced Course',
            description: 'Finish the advanced React course on Udemy',
            category: GoalCategory.INDIVIDUAL,
            type: GoalType.QUALITATIVE,
            dueDate: new Date('2024-12-31'),
            progress: 45,
            status: GoalStatus.IN_PROGRESS,
            priority: Priority.HIGH,
        },
    });

    await prisma.goal.create({
        data: {
            employeeId: employee1.id,
            title: 'Improve Code Review Skills',
            description: 'Review at least 20 PRs this quarter',
            category: GoalCategory.INDIVIDUAL,
            type: GoalType.QUANTITATIVE,
            targetValue: '20',
            currentValue: '14',
            dueDate: new Date('2024-06-30'),
            progress: 70,
            status: GoalStatus.IN_PROGRESS,
            priority: Priority.MEDIUM,
        },
    });

    console.log('✅ Goals created');

    // Create sample attendance records
    console.log('Creating sample attendance records...');
    const today = new Date();
    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        await prisma.attendance.create({
            data: {
                employeeId: employee1.id,
                date: date,
                clockIn: new Date(date.setHours(9, 0, 0, 0)),
                clockOut: new Date(date.setHours(18, 0, 0, 0)),
                status: AttendanceStatus.PRESENT,
            },
        });
    }

    console.log('✅ Attendance records created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('Admin: admin@company.com / password123');
    console.log('HR: hr@company.com / password123');
    console.log('Manager: manager@company.com / password123');
    console.log('Employee: employee@company.com / password123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
