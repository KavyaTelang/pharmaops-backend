
const fetch = require('node-fetch'); // Try node-fetch first if available, else fallback to global fetch if needed (but ts-node might complain about global fetch if types aren't there)
// Actually, since I saw @types/node v20, global fetch should be available in Node environment, ensuring we run with a recent node.
// However, ts-node might use the project's tsconfig. 
// Safest is to use 'http' or just 'fetch' and see. 
// Given the user environment, I will try to use the global `fetch`.

async function verify() {
    const baseUrl = 'http://localhost:3000/api';

    try {
        console.log('1. Logging in as Vendor...');
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'vendor@fastlogistics.com',
                password: 'vendor123'
            })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Login successful. Token received.');

        console.log('\n2. Testing access to /admin/products (Should SUCCEED)...');
        const productsRes = await fetch(`${baseUrl}/admin/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (productsRes.ok) {
            console.log('✅ Success: Accessed /admin/products (Status 200)');
        } else {
            console.error(`❌ Failed: Could not access /admin/products (Status ${productsRes.status})`);
            const text = await productsRes.text();
            console.error('Response:', text);
        }

        console.log('\n3. Testing access to /admin/vendors (Should FAIL)...');
        const vendorsRes = await fetch(`${baseUrl}/admin/vendors`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (vendorsRes.status === 403) {
            console.log('✅ Success: Access to /admin/vendors denied as expected (Status 403)');
        } else if (vendorsRes.ok) {
            console.error('❌ Failed: Vendor could access /admin/vendors! (Status 200)');
        } else {
            console.log(`ℹ️ Access denied with status ${vendorsRes.status} (Expected 403)`);
        }

    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

verify();
