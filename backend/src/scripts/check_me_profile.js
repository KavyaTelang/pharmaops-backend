
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

        const token = loginRes.data.token;
        console.log('✅ Login successful');

        console.log('\n2. Testing /api/auth/me...');
        const meRes = await request('/api/auth/me', 'GET', undefined, token);

        console.log('Me Response User Object:', JSON.stringify(meRes.data.user, null, 2));

        if (meRes.data.user && !meRes.data.user.vendorProfile) {
            console.log('❌ ISSUE: vendorProfile is MISSING in /me response.');
        } else {
            console.log('✅ vendorProfile is PRESENT in /me response.');
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

run();
