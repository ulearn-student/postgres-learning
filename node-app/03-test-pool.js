const pool = require('./db');

async function test() {
    console.log('🚀 测试连接池...\n');

    // 模拟 10 个并发查询
    const queries = [];
    for (let i = 0; i < 10; i++) {
        const q = pool.query('SELECT $1 AS query_id', [i])
            .then(r => console.log(`✅ 查询 ${r.rows[0].query_id} 完成`));
        queries.push(q);
    }

    await Promise.all(queries);

    console.log('\n📊 连接池状态:');
    console.log('   总连接数:', pool.totalCount);
    console.log('   空闲连接:', pool.idleCount);
    console.log('   等待中:', pool.waitingCount);

    await pool.end();
    console.log('\n✅ 连接池已关闭');
}

test();