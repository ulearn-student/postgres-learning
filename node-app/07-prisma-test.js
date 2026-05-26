const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'error']
});

async function main() {
    try {
        // ===== 1. 查询所有用户 =====
        console.log('========== 1. 查询所有用户 ==========');
        const users = await prisma.users.findMany({
            orderBy: { created_at: 'desc' }
        });
        console.table(users.map(u => ({
            id: u.id.toString(),
            username: u.username,
            email: u.email,
            age: u.age
        })));

        // ===== 2. 查询单个用户 =====
        console.log('\n========== 2. 查询单个用户 ==========');
        const user = await prisma.users.findUnique({
            where: { id: BigInt(1) }
        });
        console.log('用户:', user?.username, '| 邮箱:', user?.email);

        // ===== 3. 创建用户 =====
        console.log('\n========== 3. 创建用户 ==========');
        const newUser = await prisma.users.create({
            data: {
                username: `Prisma用户${Date.now()}`,
                email: `prisma${Date.now()}@example.com`,
                password_hash: 'hashed_xxx',
                age: 25
            }
        });
        console.log('✅ 新用户:', newUser.username, '| ID:', newUser.id.toString());

        // ===== 4. 更新用户 =====
        console.log('\n========== 4. 更新用户 ==========');
        const updated = await prisma.users.update({
            where: { id: newUser.id },
            data: { age: 26 }
        });
        console.log('✅ 更新后年龄:', updated.age);

        // ===== 5. 关联查询(用户+订单) =====
        console.log('\n========== 5. 关联查询 ==========');
        const userWithOrders = await prisma.users.findUnique({
            where: { id: BigInt(1) },
            include: {
                orders: {
                    include: { products: true },
                    orderBy: { created_at: 'desc' },
                    take: 3
                }
            }
        });
        console.log(`用户 ${userWithOrders.username} 的最近订单:`);
        userWithOrders.orders.forEach(o => {
            console.log(`  订单#${o.id} | 商品:${o.products.name} | 金额:${o.total} | 状态:${o.status}`);
        });

        // ===== 6. 事务 =====
        console.log('\n========== 6. Prisma 事务 ==========');
        const order = await prisma.$transaction(async (tx) => {
            const product = await tx.products.findUnique({
                where: { id: BigInt(1) }
            });
            if (!product || product.stock < 1) throw new Error('库存不足');

            const newOrder = await tx.orders.create({
                data: {
                    user_id: BigInt(1),
                    product_id: BigInt(1),
                    quantity: 1,
                    total: product.price,
                    status: 'pending'
                }
            });
            await tx.products.update({
                where: { id: BigInt(1) },
                data: { stock: { decrement: 1 } }
            });
            return newOrder;
        });
        console.log('✅ 事务下单成功，订单ID:', order.id.toString());

        // ===== 7. 聚合统计 =====
        console.log('\n========== 7. 聚合统计 ==========');
        const stats = await prisma.orders.aggregate({
            _count: { id: true },
            _sum: { total: true },
            _avg: { total: true }
        });
        console.log('总订单数:', stats._count.id);
        console.log('总金额:', stats._sum.total?.toString());
        console.log('平均金额:', stats._avg.total?.toString());

        // ===== 8. 删除测试用户 =====
        await prisma.users.delete({ where: { id: newUser.id } });
        console.log('\n🗑️  测试用户已清理');

    } catch (error) {
        console.error('❌ 错误:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();