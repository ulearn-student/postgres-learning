const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: '123456',
    database: 'shop_db',
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
    console.log('🔌 新连接建立,当前连接数:', pool.totalCount);
});

pool.on('error', (err) => {
    console.error('💥 连接池错误:', err.message);
});

process.on('SIGINT', async () => {
    console.log('\n👋 正在关闭连接池...');
    await pool.end();
    process.exit(0);
});

module.exports = pool;