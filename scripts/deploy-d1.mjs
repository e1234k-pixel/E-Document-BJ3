import fs from 'fs';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID || '7753a573-d4f3-4d52-9fc5-efcf3d21c613';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';

if (!ACCOUNT_ID || !API_TOKEN) {
  console.error('❌ Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables.');
  process.exit(1);
}

async function executeSql(sql) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(JSON.stringify(data.errors || data));
  }
  return data;
}

async function run() {
  console.log('🚀 Executing Schema Migration (0000_init_schema.sql)...');
  const schemaSql = fs.readFileSync('migrations/0000_init_schema.sql', 'utf8');
  await executeSql(schemaSql);
  console.log('✅ Schema created successfully!');

  console.log('🚀 Executing Seed Data (0001_seed_data.sql)...');
  const seedSql = fs.readFileSync('migrations/0001_seed_data.sql', 'utf8');
  await executeSql(seedSql);
  console.log('✅ Seed data inserted successfully!');

  // Verify
  const testRes = await executeSql('SELECT COUNT(*) as count FROM users');
  console.log('🎉 Verification count of users:', testRes.result[0].results[0].count);
}

run().catch((err) => {
  console.error('❌ Error executing SQL:', err.message);
  process.exit(1);
});
