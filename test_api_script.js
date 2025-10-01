// Test API script - run in browser console
async function testCreateCampaign() {
    // First login to get admin token
    console.log('Step 1: Login as admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: 'admin@donationmanagement.com',
            password: 'Admin@123!'
        })
    });
    
    if (!loginResponse.ok) {
        console.error('Login failed:', await loginResponse.text());
        return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData);
    
    const token = loginData.token;
    
    // Now create campaign
    console.log('Step 2: Creating campaign...');
    const formData = new FormData();
    formData.append('title', 'Test Campaign via Script');
    formData.append('description', 'This is a test campaign created via script');
    formData.append('targetAmount', '50000');
    formData.append('category', 'health');
    formData.append('location', 'Dhaka, Bangladesh');
    formData.append('startDate', '2025-09-30');
    formData.append('endDate', '2025-12-30');
    formData.append('isUrgent', 'false');
    formData.append('isFeatured', 'false');
    
    const createResponse = await fetch('http://localhost:5000/api/campaign/admin/create', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    });
    
    console.log('Create campaign response status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('Create campaign response:', createData);
    
    if (createResponse.ok) {
        console.log('✅ Campaign created successfully!');
    } else {
        console.error('❌ Failed to create campaign');
    }
}

// Run the test
testCreateCampaign();