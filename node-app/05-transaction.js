const { withTransaction } = require('./transaction');
const pool = require('./db');

async function createOrder(userId, productId, quantity) {
    return await withTransaction(async (client) => {

        // 1. 查询商品并加行锁(防止并发超卖)
        const productResult = await client.query(
            'SELECT * FROM products WHERE id = $1 FOR UPDATE',
            [productId]
        );

        if (productResult.rows.length === 0) throw new Error('商品不存在');
        const product = productResult.rows[0];
        console.log(`📦 商品: ${product.name}, 库存: ${product.stock}`);

        // 2. 检查库存
        if (product.stock < quantity) throw new Error(`库存不足! 需要${quantity}件,只有${product.stock}件`);

        // 3. 计算总价
        const total = (parseFloat(product.price) * quantity).toFixed(2);

        // 4. 创建订单
        const orderResult = await client.query(`
            INSERT INTO orders (user_id, product_id, quantity, total, status)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING id, created_at
        `, [userId, productId, quantity, total]);

        console.log(`📝 订单创建成功: #${orderResult.rows[0].id}`);

        // 5. 扣减库存
        await client.query(
            'UPDATE products SET stock = stock - $1 WHERE id = $2',
            [quantity, productId]
        );
        console.log(`📉 库存已扣减 ${quantity} 件`);

        return { orderId: orderResult.rows[0].id, total };
    });
}

async function main() {
    try {
        console.log('========== 测试1: 正常下单 ==========');
        const order = await createOrder(1, 1, 2);
        console.log('✅ 下单成功:', order);

        console.log('\n========== 测试2: 库存不足 ==========');
        try {
            await createOrder(1, 1, 99999);
        } catch (error) {
            console.log('✅ 正确拦截:', error.message);
        }

        console.log('\n========== 测试3: 商品不存在 ==========');
        try {
            await createOrder(1, 99999, 1);
        } catch (error) {
            console.log('✅ 正确拦截:', error.message);
        }

    } finally {
        await pool.end();
    }
}

main();