
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
        console.log('Logging in as Vendor...');
        const loginRes = await request('/api/auth/login', 'POST', {
            email: 'vendor@fastlogistics.com',
            password: 'vendor123'
        });

        console.log('Login Response User Object:', JSON.stringify(loginRes.data.user, null, 2));

        if (loginRes.data.user && !loginRes.data.user.vendorProfile) {
            console.log('❌ ISSUE CONFIRMED: vendorProfile is missing from user object.');
        } else {
            console.log('✅ vendorProfile is present (or user object is missing).');
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

run();
