
const login = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'vendor@fastlogistics.com',
        password: 'vendor123'
      })
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Body:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
};

login();
