const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: '123456'
    });
    
    console.log('Login successful!');
    console.log('Token:', response.data.token.substring(0, 20) + '...');
    console.log('User:', response.data.user);
    
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testLogin(); 