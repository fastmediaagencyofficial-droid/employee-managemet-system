import prisma from '../src/config/database';

async function checkUsers() {
    const emails = [
        'fastmediaagencyofficial@gmail.com',
        'xfastgroup001@gmail.com',
        'hafsaakbar071@gmail.com'
    ];

    console.log('Checking for users in database:', process.env.DATABASE_URL?.split('@')[1]); // Log host only for safety

    for (const email of emails) {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, role: true, name: true }
        });

        if (user) {
            console.log(`✅ Found user: ${user.email} (${user.role})`);
        } else {
            console.log(`❌ User NOT found: ${email}`);
        }
    }
}

checkUsers()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
