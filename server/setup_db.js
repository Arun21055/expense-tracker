require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  console.log('Connecting to', process.env.DB_HOST, 'as', process.env.DB_USER);
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    multipleStatements: true,
  });
  console.log('Connected.');

  const file = path.join(__dirname, '..', 'database', 'schema.sql');
  const sql = fs.readFileSync(file, 'utf8');
  console.log('Read schema.sql,', sql.length, 'characters');

  await conn.query(sql);
  console.log('Schema executed.');

  const [tables] = await conn.query('SHOW TABLES FROM expense_tracker');
  console.log('Tables:', tables);
  await conn.end();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });