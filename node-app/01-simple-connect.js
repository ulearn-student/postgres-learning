// 文件: 01-simple-connect.js
// 最简单的数据库连接示例 - 用 Client(单连接)

// ========== 1. 导入依赖 ==========
const { Client } = require('pg');           // 从 pg 库导入 Client 类
require('dotenv').config();                  // 加载 .env 文件中的环境变量

// ========== 2. 创建数据库客户端 ==========
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// ========== 3. 异步主函数 ==========
async function main() {
    try {
        await client.connect();
        console.log('✅ 数据库连接成功!');
        
        const result = await client.query('SELECT NOW() AS current_time');
        console.log('当前数据库时间:', result.rows[0].current_time);
        
        const users = await client.query('SELECT * FROM users');
        console.log(`\n📊 查询到 ${users.rowCount} 个用户:`);
        console.table(users.rows);
        
    } catch (error) {
        console.error('❌ 数据库操作失败:', error.message);
    } finally {
        await client.end();
        console.log('🔚 数据库连接已关闭');
    }
}

main();