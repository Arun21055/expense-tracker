const mysql = require('mysql2/promise');

const isLocal = !process.env.DB_HOST || process.env.DB_HOST === 'localhost';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: isLocal ? undefined : { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;