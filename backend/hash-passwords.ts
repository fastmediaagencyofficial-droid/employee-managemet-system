import * as bcrypt from 'bcrypt';

async function generateHashes() {
    const p1 = await bcrypt.hash('KAKKEZg6HpbruJHU!@#', 12);
    const p2 = await bcrypt.hash('LCZlBkIxDkmLjflv!@#', 12);
    const p3 = await bcrypt.hash('dA/bm1BIW5ZXUWjn!@#', 12);

    console.log(`fastmedia: ${p1}`);
    console.log(`xfast: ${p2}`);
    console.log(`hafsa: ${p3}`);
}

generateHashes();
