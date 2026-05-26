const { Client } = require('pg');
require('dotenv').config();

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

        // ===== ✅ 正确写法:参数化查询 =====
        const safeSQL = 'SELECT * FROM users WHERE id = $1';
        const result = await client.query(safeSQL, [1]);
        console.log('✅ 查询结果:');
        console.table(result.rows);

        // ===== 多个参数的写法 =====
        const result2 = await client.query(
            'SELECT * FROM users WHERE username = $1 AND id = $2',
            ['张三', 1]
        );
        console.log('\n多参数查询结果:');
        console.table(result2.rows);

        // ===== INSERT 的参数化(带 RETURNING)=====
        const insertSQL = `
            INSERT INTO users (username, email, password_hash, age)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, created_at
        `;
        const newUser = await client.query(insertSQL, [
            '测试用户' + Date.now(),
            `test${Date.now()}@example.com`,
            'hashed_password',
            22
        ]);
        console.log('\n✅ 新插入用户:');
        console.log(newUser.rows[0]);

    } catch (error) {
        console.error('❌ 错误:', error.message);
    } finally {
        await client.end();
    }
}

main();