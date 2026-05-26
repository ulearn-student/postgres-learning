const pool = require('./db');

async function main() {
    try {
        await pool.query(`
            INSERT INTO amazon_sales (asin, product_name, category, units_sold, revenue, sale_date) VALUES
                ('B08N5WRWNW', 'Echo Dot 4', 'Electronics', 50, 2499.50, '2025-05-23'),
                ('B08N5WRWNW', 'Echo Dot 4', 'Electronics', 35, 1749.65, '2025-05-24'),
                ('B08N5WRWNW', 'Echo Dot 4', 'Electronics', 42, 2099.58, '2025-05-25'),
                ('B0BDHWDR12', 'Kindle Paperwhite', 'Electronics', 20, 2799.80, '2025-05-23'),
                ('B0BDHWDR12', 'Kindle Paperwhite', 'Electronics', 25, 3499.75, '2025-05-24'),
                ('B07FZ8S74R', 'Yoga Mat', 'Sports', 100, 1999.00, '2025-05-23'),
                ('B07FZ8S74R', 'Yoga Mat', 'Sports', 80, 1599.20, '2025-05-24')
            ON CONFLICT DO NOTHING
        `);
        console.log('✅ amazon_sales 数据插入成功');
    } catch (e) {
        console.error('❌ 错误:', e.message);
    } finally {
        await pool.end();
    }
}

main();