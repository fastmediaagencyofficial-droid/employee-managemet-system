import fetch from 'node-fetch';

async function testForgotPassword() {
    const url = 'http://127.0.0.1:5000/api/auth/forgot-password';
    console.log(`Testing endpoint: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'adeelmaheen602@gmail.com' })
        });

        console.log(`Status: ${response.status}`);
        const data = await response.json();
        console.log('Response:', data);

        if (response.ok) {
            console.log('✅ Endpoint is reachable and working.');
        } else {
            console.log('❌ Endpoint returned error.');
        }
    } catch (error) {
        console.error('❌ Failed to connect:', error);
    }
}

testForgotPassword();
