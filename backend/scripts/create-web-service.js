import https from 'https';

const API_KEY = 'rnd_E6GGs6PzdUy5aLU4wfWpKTyJh0uE';
const OWNER_ID = 'tea-d419fdili9vc739hocog';

const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.render.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const createWebService = async () => {
  const serviceData = {
    type: 'web_service',
    name: 'secondwind-backend',
    ownerId: OWNER_ID,
    repo: 'https://github.com/oranolio956/MetzlerCares-Final',
    branch: 'main',
    rootDir: 'backend',
    serviceDetails: {
      env: 'node',
      plan: 'starter',
      region: 'oregon',
      envSpecificDetails: {
        buildCommand: 'npm install && npm run build',
        startCommand: 'npm start',
      },
    },
  };

  console.log('Creating web service...');
  console.log('Data:', JSON.stringify(serviceData, null, 2));
  
  const result = await makeRequest('POST', '/v1/services', serviceData);
  return result;
};

const main = async () => {
  try {
    const result = await createWebService();
    console.log('\nResult Status:', result.status);
    console.log('Result Data:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 201 || result.status === 200) {
      console.log('\n✅ Web service created successfully!');
      console.log('Service ID:', result.data?.service?.id || 'N/A');
      console.log('Dashboard:', result.data?.service?.dashboardUrl || 'N/A');
    } else {
      console.log('\n❌ Failed to create service');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

main();
