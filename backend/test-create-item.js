const axios = require('axios');

async function testCreateItem() {
  try {
    // First, let's login to get a token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token:', token.substring(0, 20) + '...');
    
    // Now test creating an item
    const formData = new FormData();
    formData.append('property_no', 'TEST-PC-001');
    formData.append('article_type', 'Desktop Computer');
    formData.append('location', 'Test Location');
    formData.append('end_user', 'Test User');
    formData.append('date_acquired', '2025-01-01');
    formData.append('price', '50000');
    formData.append('supply_officer', 'Test Officer');
    formData.append('specifications', 'Test Specs');
    formData.append('maintenance_date', '2025-01-01');
    formData.append('maintained_by', 'Test Maintainer');
    formData.append('maintenance_tasks', JSON.stringify([
      { id: '1', task: 'Antivirus Check', completed: false, notes: '' },
      { id: '2', task: 'Software Updates', completed: false, notes: '' }
    ]));
    formData.append('diagnostic', JSON.stringify({
      system_status: 'Good',
      findings: '',
      recommendations: ''
    }));
    
    console.log('Sending create item request...');
    
    const createResponse = await axios.post('http://localhost:5000/api/items', formData, {
      headers: {
        'Authorization': token,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Success:', createResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('500 Internal Server Error details:', error.response.data);
    }
  }
}

testCreateItem(); 