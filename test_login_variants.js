
const login = async (email, password) => {
    console.log(`Attempting login with: '${email}', '${password}'`);
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        console.log('Status:', response.status);
        if (!response.ok) {
            const err = await response.json();
            console.log('Error Body:', err);
        } else {
            const data = await response.json();
            console.log('Success.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

// Test valid
console.log("--- Test 1: Valid ---");
login('vendor@fastlogistics.com', 'vendor123').then(() => {
    // Test invalid email space
    console.log("\n--- Test 2: Email Space ---");
    login('vendor@fastlogistics.com ', 'vendor123').then(() => {
        // Test invalid password space
        console.log("\n--- Test 3: Password Space ---");
        login('vendor@fastlogistics.com', 'vendor123 ');
    });
});
