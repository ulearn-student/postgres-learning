const { Client } = require('pg');

const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: '123456',
    database: 'shop_db',
});

async function main() {
    try {
        await client.connect();
        console.log('✅ 连接成功!');
        const result = await client.query('SELECT NOW()');
        console.log('时间:', result.rows[0].now);
    } catch (error) {
        console.error('❌ 失败:', error.message);
    } finally {
        await client.end();
    }
}

main();