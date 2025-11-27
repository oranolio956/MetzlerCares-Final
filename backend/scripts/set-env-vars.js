import https from 'https';

const API_KEY = 'rnd_E6GGs6PzdUy5aLU4wfWpKTyJh0uE';
const SERVICE_ID = 'srv-d4k3v3fgi27c73cgncl0';

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

// Environment variables to set
const envVars = {
  NODE_ENV: 'production',
  PORT: '10000',
  API_VERSION: 'v1',
  JWT_SECRET: '2622669bd19e510e2c459e6c7df29fe071e2048a3a30272224df9691f6fa9863',
  JWT_REFRESH_SECRET: '519fc170477eed0ff915b8afe88015c6547c018a9f57a1ea81c1e26624a6abba',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  ENCRYPTION_SALT: 'e2f77a167b00d760c51219c4c4e9662050031c639a92a3f9fd5ff6ce4c293caa',
  CORS_ORIGIN: 'https://secondwind.org',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100',
  LOG_LEVEL: 'info',
};

const setEnvVars = async () => {
  console.log('Setting environment variables...\n');
  
  for (const [key, value] of Object.entries(envVars)) {
    const data = {
      key: key,
      value: value,
    };
    
    console.log(`Setting ${key}...`);
    const result = await makeRequest('POST', `/v1/services/${SERVICE_ID}/env-vars`, data);
    
    if (result.status === 201 || result.status === 200) {
      console.log(`  ✅ ${key} set successfully`);
    } else {
      console.log(`  ❌ Failed: ${JSON.stringify(result.data)}`);
    }
  }
};

const main = async () => {
  try {
    await setEnvVars();
    console.log('\n✅ Environment variables configuration complete!');
    console.log('\nNote: DATABASE_URL and REDIS_URL will be set automatically');
    console.log('when you link the database and Redis services in the dashboard.');
  } catch (error) {
    console.error('Error:', error);
  }
};

main();
