import https from 'https';
import { execSync } from 'child_process';

const API_KEY = 'rnd_E6GGs6PzdUy5aLU4wfWpKTyJh0uE';
const API_BASE = 'https://api.render.com/v1';

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
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: body });
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

// Get owner ID
const getOwnerId = async () => {
  const result = await makeRequest('GET', '/owners');
  if (result.status === 200 && result.data && result.data.length > 0) {
    // API returns {owner: {id: ...}}
    return result.data[0].owner?.id || result.data[0].id;
  }
  throw new Error('Could not get owner ID: ' + JSON.stringify(result));
};

// Create PostgreSQL database
const createDatabase = async (ownerId) => {
  const data = {
    name: 'secondwind-db',
    databaseName: 'secondwind',
    user: 'secondwind_user',
    plan: 'starter',
    region: 'oregon',
    postgresMajorVersion: 15,
    ownerId: ownerId,
  };

  console.log('Creating PostgreSQL database...');
  const result = await makeRequest('POST', '/databases', data);
  return result;
};

// Create Redis
const createRedis = async (ownerId) => {
  const data = {
    name: 'secondwind-redis',
    plan: 'starter',
    region: 'oregon',
    maxmemoryPolicy: 'allkeys-lru',
    ownerId: ownerId,
  };

  console.log('Creating Redis instance...');
  const result = await makeRequest('POST', '/redis', data);
  return result;
};

// Main
const main = async () => {
  try {
    console.log('=== Render Service Creation via API ===\n');
    
    // Get owner ID
    console.log('1. Getting owner ID...');
    const ownerId = await getOwnerId();
    console.log(`   Owner ID: ${ownerId}\n`);

    // Create database
    console.log('2. Creating PostgreSQL database...');
    const dbResult = await createDatabase(ownerId);
    console.log(`   Status: ${dbResult.status}`);
    if (dbResult.status === 201 || dbResult.status === 200) {
      console.log('   ✅ Database created successfully!');
      console.log('   Database ID:', dbResult.data?.database?.id || 'N/A');
    } else {
      console.log('   Response:', JSON.stringify(dbResult.data, null, 2));
    }
    console.log('');

    // Create Redis
    console.log('3. Creating Redis instance...');
    const redisResult = await createRedis(ownerId);
    console.log(`   Status: ${redisResult.status}`);
    if (redisResult.status === 201 || redisResult.status === 200) {
      console.log('   ✅ Redis created successfully!');
      console.log('   Redis ID:', redisResult.data?.redis?.id || 'N/A');
    } else {
      console.log('   Response:', JSON.stringify(redisResult.data, null, 2));
    }
    console.log('');

    console.log('=== Next Steps ===');
    console.log('1. Create Web Service via Render Dashboard');
    console.log('2. Link Database and Redis to Web Service');
    console.log('3. Set environment variables (see .render.env.example)');
    console.log('4. Deploy!');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  }
};

main();
