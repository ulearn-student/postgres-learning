const userRepo = require('./userRepository');
const pool = require('./db');

async function main() {
    try {
        console.log('========== 1. 查询所有用户 ==========');
        const users = await userRepo.findAll();
        console.table(users);

        console.log('\n========== 2. 根据 ID 查询 ==========');
        const user = await userRepo.findById(1);
        console.log(user);

        console.log('\n========== 3. 创建新用户 ==========');
        const newUser = await userRepo.create({
            username: `用户${Date.now()}`,
            email: `user${Date.now()}@example.com`,
            password_hash: 'hashed_xxx',
            age: 25
        });
        console.log('✅ 新用户:', newUser);

        console.log('\n========== 4. 更新用户 ==========');
        const updated = await userRepo.update(newUser.id, {
            age: 26,
            username: '更新后的名字'
        });
        console.log('✅ 更新后:', updated);

        console.log('\n========== 5. 分页查询 ==========');
        const paged = await userRepo.findWithPagination({
            page: 1,
            pageSize: 5
        });
        console.log('数据:', paged.data);
        console.log('分页信息:', paged.pagination);

        console.log('\n========== 6. 删除用户 ==========');
        const deleted = await userRepo.deleteById(newUser.id);
        console.log('删除成功:', deleted);

        console.log('\n========== 7. 测试唯一约束错误 ==========');
        try {
            await userRepo.create({
                username: '张三',
                email: 'duplicate@example.com',
                password_hash: 'xxx',
                age: 30
            });
        } catch (error) {
            console.log('✅ 正确捕获错误:', error.message);
        }

    } catch (error) {
        console.error('💥 错误:', error);
    } finally {
        await pool.end();
    }
}

main();