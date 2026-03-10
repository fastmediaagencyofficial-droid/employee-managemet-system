const bcrypt = require('bcrypt');

const passwords = [
    { email: 'fastmediaagencyofficial@gmail.com', password: 'KAKKEZg6HpbruJHU!@#' },
    { email: 'xfastgroup001@gmail.com', password: 'LCZlBkIxDkmLjflv!@#' },
    { email: 'hafsaakbar071@gmail.com', password: 'dA/bm1BIW5ZXUWjn!@#' },
];

async function main() {
    for (const p of passwords) {
        const hash = await bcrypt.hash(p.password, 12);
        console.log(`Email: ${p.email}`);
        console.log(`Hash:  ${hash}`);
        console.log('---');
    }
}

main();
