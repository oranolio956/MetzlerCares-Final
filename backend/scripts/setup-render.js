import https from 'https';
import { execSync } from 'child_process';

const API_KEY = 'rnd_E6GGs6PzdUy5aLU4wfWpKTyJh0uE';
const API_BASE = 'https://api.render.com/v1';

// Generate secrets
const generateSecret = (length = 64) => {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
};

const secrets = {
  JWT_SECRET: generateSecret(32),
  JWT_REFRESH_SECRET: generateSecret(32),
  ENCRYPTION_SALT: generateSecret(32),
};

console.log('Generated Secrets:');
console.log(JSON.stringify(secrets, null, 2));

// Make API request to Render
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
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
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

// Get services
const getServices = async () => {
  const result = await makeRequest('GET', '/services');
  return result;
};

// Create database
const createDatabase = async (name = 'secondwind-db') => {
  const data = {
    name: name,
    databaseName: 'secondwind',
    user: 'secondwind_user',
    plan: 'starter', // free tier
    region: 'oregon',
    postgresMajorVersion: 15,
  };

  const result = await makeRequest('POST', '/databases', data);
  return result;
};

// Create web service
const createWebService = async (repoUrl, envVars = {}) => {
  const data = {
    name: 'secondwind-backend',
    type: 'web_service',
    repo: repoUrl,
    branch: 'main',
    rootDir: 'backend',
    buildCommand: 'npm install && npm run build',
    startCommand: 'npm start',
    plan: 'starter', // free tier
    region: 'oregon',
    envVars: envVars,
  };

  const result = await makeRequest('POST', '/services', data);
  return result;
};

// Main setup
const main = async () => {
  console.log('\n=== Render Setup Script ===\n');
  
  console.log('1. Checking existing services...');
  const services = await getServices();
  console.log('Services:', JSON.stringify(services, null, 2));
  
  console.log('\n2. Secrets generated:');
  console.log(JSON.stringify(secrets, null, 2));
  
  console.log('\n3. To create database, run:');
  console.log('   render databases create --name secondwind-db --database secondwind --user secondwind_user');
  
  console.log('\n4. To create web service, use render.yaml or Render dashboard');
};

main().catch(console.error);
