import https from 'https';

const API_KEY = 'rnd_E6GGs6PzdUy5aLU4wfWpKTyJh0uE';
const SERVICE_ID = 'srv-d4k3v3fgi27c73cgncl0';

const makeRequest = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.render.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

const getLatestDeploy = async () => {
  const result = await makeRequest(`/v1/services/${SERVICE_ID}/deploys`);
  if (result.status === 200 && result.data && result.data.length > 0) {
    return result.data[0].deploy;
  }
  return null;
};

const getDeployLogs = async (deployId) => {
  const result = await makeRequest(`/v1/deploys/${deployId}/logs`);
  if (result.status === 200) {
    return result.data.logs || '';
  }
  return '';
};

const watchDeployment = async () => {
  console.log('🔍 Monitoring Render deployment continuously...\n');
  console.log('Service: secondwind-backend');
  console.log('URL: https://secondwind-backend.onrender.com\n');
  
  let lastDeployId = null;
  let lastLogLength = 0;
  let checkCount = 0;
  
  while (true) {
    try {
      checkCount++;
      const deploy = await getLatestDeploy();
      
      if (deploy) {
        const deployId = deploy.id;
        const status = deploy.status;
        
        // New deploy detected
        if (deployId !== lastDeployId) {
          lastDeployId = deployId;
          lastLogLength = 0;
          console.log(`\n📦 New Deploy: ${deployId}`);
          console.log(`   Status: ${status}`);
          console.log(`   Created: ${new Date(deploy.createdAt).toLocaleString()}`);
          console.log('');
        }
        
        // Get and display new logs
        const logs = await getDeployLogs(deployId);
        if (logs && logs.length > lastLogLength) {
          const newLogs = logs.substring(lastLogLength);
          process.stdout.write(newLogs);
          lastLogLength = logs.length;
        }
        
        // Status updates
        if (checkCount % 10 === 0) {
          const time = new Date().toLocaleTimeString();
          console.log(`\n[${time}] Status: ${status}`);
        }
        
        // Check if finished
        if (status === 'live') {
          console.log('\n\n✅✅✅ DEPLOYMENT SUCCESSFUL! ✅✅✅\n');
          console.log('🎉 Service is LIVE!');
          console.log('🌐 URL: https://secondwind-backend.onrender.com');
          console.log('📊 Dashboard: https://dashboard.render.com/web/srv-d4k3v3fgi27c73cgncl0');
          console.log('\n✅ Deployment complete and service is running!');
          break;
        }
        
        if (status === 'build_failed' || status === 'update_failed' || status === 'canceled') {
          console.log('\n\n❌ Deployment failed!');
          console.log(`   Status: ${status}`);
          console.log('   Check logs above for errors');
          console.log('\n   Fixing errors and retrying...');
          
          // Wait a bit then check for new deploy
          await new Promise(resolve => setTimeout(resolve, 5000));
          lastDeployId = null; // Reset to catch new deploy
          continue;
        }
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error('Error:', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

watchDeployment().catch(console.error);
