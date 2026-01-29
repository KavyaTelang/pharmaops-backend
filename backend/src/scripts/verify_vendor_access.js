
const http = require('http');

function request(path, method, body, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

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

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function run() {
    try {
        console.log('1. Logging in...');
        const loginRes = await request('/api/auth/login', 'POST', {
            email: 'vendor@fastlogistics.com',
            password: 'vendor123'
        });

        if (loginRes.status !== 200 || !loginRes.data.token) {
            console.error('Login failed:', loginRes);
            process.exit(1);
        }

        const token = loginRes.data.token;
        console.log('✅ Login successful');

        console.log('\n2. Testing /admin/products (Expect 200)...');
        const prodRes = await request('/api/admin/products', 'GET', undefined, token);
        if (prodRes.status === 200) {
            console.log('✅ Success: Accessed /admin/products');
        } else {
            console.error('❌ Failed: /admin/products returned', prodRes.status);
            console.error('Data:', prodRes.data);
        }

        console.log('\n3. Testing /admin/vendors (Expect 403)...');
        const vendRes = await request('/api/admin/vendors', 'GET', undefined, token);
        if (vendRes.status === 403) {
            console.log('✅ Success: Access denied for /admin/vendors');
        } else {
            console.error('❌ Failed: /admin/vendors returned', vendRes.status);
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

run();
