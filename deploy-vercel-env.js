const { execSync } = require('child_process');
const fs = require('fs');

function pushEnv(dir, key, val) {
  console.log(`Setting ${key} in ${dir}...`);
  try {
     execSync(`npx.cmd vercel env rm ${key} production -y`, { cwd: dir, stdio: 'ignore' });
  } catch(e) {}
  
  try {
    // Inject string directly into stdin of vercel cli
    execSync(`npx.cmd vercel env add ${key} production`, { cwd: dir, input: val });
    console.log(`✅ Success: ${key}`);
  } catch(e) {
    console.log(`❌ Failed: ${key}`);
  }
}

console.log('--- STARTING ENV PUSH ---');

try {
    const envRaw = fs.readFileSync('api/.env', 'utf8');
    const lines = envRaw.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const idx = line.indexOf('=');
        const key = line.slice(0, idx).trim();
        let val = line.slice(idx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        }
        
        if (['DATABASE_URL', 'DIRECT_URL', 'JWT_SECRET', 'TOSS_SECRET_KEY', 'TOSS_CLIENT_KEY'].includes(key)) {
           pushEnv('api', key, val);
        }
      }
    }

    // Push NEXT_PUBLIC_API_URL to frontend
    pushEnv('front', 'NEXT_PUBLIC_API_URL', 'https://api-three-black-70.vercel.app');

    console.log('--- ALL ENV SET, REDEPLOYING ---');
    console.log('Deploying API (Backend)...');
    execSync(`npx.cmd vercel --prod --yes`, { cwd: 'api', stdio: 'inherit' });
    
    console.log('Deploying Front (Frontend)...');
    execSync(`npx.cmd vercel --prod --yes`, { cwd: 'front', stdio: 'inherit' });
    console.log('\n🎉 ALL DONE!');
} catch (err) {
    console.error('Fatal Error:', err);
}
