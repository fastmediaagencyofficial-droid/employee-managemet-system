import { PrismaClient } from '@prisma/client';
import { createEmployee, deleteEmployee } from './src/controllers/employeeController';

const prisma = new PrismaClient();

const mockRes = {
    status: (code: number) => {
        return {
            json: (data: any) => {
                console.log(`Response [${code}]:`, JSON.stringify(data, null, 2));
                return data;
            }
        };
    },
    json: (data: any) => {
        console.log(`Response [200]:`, JSON.stringify(data, null, 2));
        return data;
    }
} as any;

async function testSequence() {
    console.log("=== STARTING TEST SEQUENCE ===");
    
    // First, let's fetch a valid department
    const dept = await prisma.department.findFirst();
    if (!dept) {
        console.log("No department found! Cannot run test.");
        return;
    }
    console.log(`Found department: ${dept.name} (${dept.id})`);

    const mockEmail = `test_flow_${Date.now()}@example.com`;
    const mockCnic = `12345-${Date.now().toString().slice(0, 7)}-1`;
    let createdUserId = '';
    let createdEmployeeId = '';
    
    const mockReqCreate = {
        body: {
            firstName: "Test",
            lastName: "User",
            email: mockEmail,
            phone: `+1234567${Date.now().toString().slice(-4)}`,
            dateOfBirth: "1990-01-01",
            gender: "MALE",
            address: "123 Test St",
            city: "Testville",
            country: "Testland",
            position: "Tester",
            departmentId: dept.id,
            salary: 50000,
            hireDate: "2024-01-01",
            employmentType: "FULL_TIME",
            cnic: mockCnic
        }
    } as any;

    try {
        console.log("\n1. CREATING EMPLOYEE...");
        const result1 = await createEmployee(mockReqCreate, mockRes);
        console.log("Create outcome logged above.");
        
        // Find the created employee directly to get its genuine ID for deletion
        const createdEmp = await prisma.employee.findUnique({
            where: { email: mockEmail }
        });

        if (createdEmp) {
            console.log("\nEmployee successfully found in database:", createdEmp.employeeId);
            createdUserId = createdEmp.userId;
            createdEmployeeId = createdEmp.id;
        } else {
            console.log("\nTest failed: Employee not found in DB after creation attempt.");
            process.exit(1);
        }

        console.log(`\n2. DELETING EMPLOYEE (DB ID: ${createdEmployeeId})...`);
        const mockReqDelete = {
            params: { id: createdEmployeeId }
        } as any;
        
        await deleteEmployee(mockReqDelete, mockRes);
        console.log("Delete outcome logged above.");

        console.log("\n3. RECREATING SAME EMPLOYEE...");
        const result2 = await createEmployee(mockReqCreate, mockRes);
        console.log("Recreate outcome logged above.");
        
        // Final verification
        const recreatedEmp = await prisma.employee.findUnique({
            where: { email: mockEmail }
        });

        if (recreatedEmp) {
            console.log(`\nSUCCESS! Employee recreated with ID: ${recreatedEmp.employeeId}`);
            
            // Clean up
            console.log("\n4. CLEANUP (Deleting again)...");
            const mockReqDelete2 = {
                params: { id: recreatedEmp.id }
            } as any;
            await deleteEmployee(mockReqDelete2, mockRes);
            console.log("Final cleanup done.");
            
        } else {
            console.log("\nTest failed: Recreated employee not in DB.");
        }

    } catch (e) {
        console.error("Caught exception:", e);
    } finally {
        await prisma.$disconnect();
    }
}

testSequence();
