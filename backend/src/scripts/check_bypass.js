
const http = require('http');

function request(path, method) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                // NO AUTHORIZATION HEADER
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                let parsedData;
                try {
                    parsedData = JSON.parse(data);
                } catch (e) {
                    parsedData = data;
                }
                resolve({
                    status: res.statusCode,
                    data: parsedData
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
}

async function run() {
    try {
        console.log('Testing /admin/products WITHOUT token...');
        // Expect 200 because we bypassed auth
        const res = await request('/api/admin/products', 'GET');

        if (res.status === 200) {
            console.log('✅ Success: Access allowed without token (Auth Bypass Working)');
            console.log('Products count:', res.data.products ? res.data.products.length : 'Unknown');
        } else {
            console.log('❌ Failed: Access denied', res.status);
            console.log('Response:', res.data);
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

run();
