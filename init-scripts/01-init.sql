-- 文件: init-scripts/01-init.sql
-- 这个文件会在数据库【首次启动时】自动执行
-- 用于初始化表结构和测试数据

-- ============ 创建用户表 ============
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,                              -- 自增主键(PostgreSQL 用 BIGSERIAL,不是 AUTO_INCREMENT)
    username VARCHAR(50) NOT NULL UNIQUE,                  -- 用户名,唯一
    email VARCHAR(100) NOT NULL UNIQUE,                    -- 邮箱,唯一
    password_hash VARCHAR(255) NOT NULL,                   -- 密码哈希(永远不存明文密码!)
    age INT,                                                -- 年龄,可为空
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- 创建时间,默认当前时间
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP         -- 更新时间
);

-- ============ 创建商品表 ============
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),     -- CHECK 约束:价格不能为负
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),      -- 库存不能为负
    description TEXT,                                       -- 商品描述(TEXT 类型可存大文本)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ 创建订单表 ============
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,                               -- 外键:用户ID
    product_id BIGINT NOT NULL,                            -- 外键:商品ID
    quantity INT NOT NULL CHECK (quantity > 0),            -- 数量必须 > 0
    total DECIMAL(10, 2) NOT NULL,                         -- 订单总金额
    status VARCHAR(20) DEFAULT 'pending',                  -- 订单状态:pending/paid/completed/cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 外键约束(就是你之前学的 FOREIGN KEY!)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- ============ 创建索引(提升查询性能)============
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ============ 插入测试数据 ============
INSERT INTO users (username, email, password_hash, age) VALUES
    ('张三', 'zhangsan@example.com', 'hashed_password_1', 25),
    ('李四', 'lisi@example.com', 'hashed_password_2', 30),
    ('王五', 'wangwu@example.com', 'hashed_password_3', 28);

INSERT INTO products (name, price, stock, description) VALUES
    ('iPhone 16 Pro', 7999.00, 100, '苹果最新款手机'),
    ('MacBook Air M3', 8999.00, 50, '苹果笔记本'),
    ('AirPods Pro 2', 1899.00, 200, '苹果无线耳机');

INSERT INTO orders (user_id, product_id, quantity, total, status) VALUES
    (1, 1, 1, 7999.00, 'completed'),
    (1, 3, 2, 3798.00, 'paid'),
    (2, 2, 1, 8999.00, 'pending');

-- ============ 完成提示(会在容器日志中打印)============
DO $$
BEGIN
    RAISE NOTICE '✅ 数据库初始化完成!已创建 users / products / orders 三张表,并插入了测试数据';
END $$;