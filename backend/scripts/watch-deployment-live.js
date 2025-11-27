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
    return result.data;
  }
  return null;
};

const watchDeployment = async () => {
  console.log('🔍 Monitoring deployment continuously...\n');
  
  let lastLogLength = 0;
  let deployId = null;
  let lastStatus = null;
  let checkCount = 0;
  
  while (true) {
    try {
      const deploy = await getLatestDeploy();
      
      if (deploy) {
        if (!deployId || deploy.id !== deployId) {
          deployId = deploy.id;
          console.log(`\n📦 Deploy: ${deployId}`);
          console.log(`   Status: ${deploy.status}`);
          console.log(`   Created: ${new Date(deploy.createdAt).toLocaleString()}`);
          lastLogLength = 0;
          lastStatus = null;
        }
        
        const status = deploy.status;
        
        // Print status if changed
        if (status !== lastStatus) {
          const time = new Date().toLocaleTimeString();
          console.log(`\n⏳ [${time}] Status: ${status}`);
          lastStatus = status;
        }
        
        // Get and display logs
        const logs = await getDeployLogs(deployId);
        if (logs && logs.logs) {
          const logText = logs.logs;
          if (logText.length > lastLogLength) {
            const newLogs = logText.substring(lastLogLength);
            process.stdout.write(newLogs);
            lastLogLength = logText.length;
          }
        }
        
        // Check if finished
        if (status === 'live') {
          console.log('\n\n✅✅✅ DEPLOYMENT SUCCESSFUL! ✅✅✅');
          console.log(`   Final Status: ${status}`);
          console.log('   🎉 Service is LIVE!');
          console.log('   🌐 URL: https://secondwind-backend.onrender.com');
          console.log('   📊 Dashboard: https://dashboard.render.com/web/srv-d4k3v3fgi27c73cgncl0');
          process.exit(0);
        }
        
        if (status === 'build_failed' || status === 'update_failed' || status === 'canceled') {
          console.log('\n\n❌ Deployment failed!');
          console.log(`   Status: ${status}`);
          console.log('   Check logs above for errors');
          process.exit(1);
        }
      }
      
      checkCount++;
      if (checkCount % 10 === 0) {
        process.stdout.write('.');
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('\nError:', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

watchDeployment();
