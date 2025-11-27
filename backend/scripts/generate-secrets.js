import crypto from 'crypto';

// Generate secure random secrets
const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

const secrets = {
  JWT_SECRET: generateSecret(32),
  JWT_REFRESH_SECRET: generateSecret(32),
  ENCRYPTION_SALT: generateSecret(32),
  STRIPE_WEBHOOK_SECRET: `whsec_${generateSecret(32)}`,
};

console.log('Generated Secrets:');
console.log('==================');
Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

// Also output as JSON for easy copying
console.log('\n\nJSON Format:');
console.log(JSON.stringify(secrets, null, 2));
