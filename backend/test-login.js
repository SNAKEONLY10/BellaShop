import axios from 'axios';

async function testLogin() {
  try {
    console.log('Testing login...\n');
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'bella888@gmail.com',
      password: 'Bella888!'
    });
    console.log('✅ LOGIN SUCCESS!\n');
    console.log('Token:', res.data.token);
    console.log('Admin:', res.data.admin);
  } catch (err) {
    console.error('❌ LOGIN FAILED\n');
    console.error('Error:', err.response?.data?.message || err.message);
  }
}

testLogin();
