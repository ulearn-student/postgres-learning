-- 文件: sql-practice/practice-01.sql
-- PostgreSQL 综合练习

-- ========== 1. 创建一个亚马逊销售数据表 ==========
DROP TABLE IF EXISTS amazon_sales;  -- 先删除(如果存在)

CREATE TABLE amazon_sales (
    id BIGSERIAL PRIMARY KEY,
    asin VARCHAR(10) NOT NULL,
    product_name TEXT NOT NULL,
    category TEXT,
    units_sold INT NOT NULL DEFAULT 0,
    revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
    sale_date DATE NOT NULL,
    metadata JSONB,                              -- 灵活属性
    tags TEXT[],                                  -- 标签数组
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== 2. 插入测试数据(模拟 3 天销售数据)==========
INSERT INTO amazon_sales (asin, product_name, category, units_sold, revenue, sale_date, metadata, tags) VALUES
    ('B08N5WRWNW', 'Echo Dot 4', 'Electronics', 50, 2499.50, '2025-05-23', '{"country": "US", "fbm": false}', ARRAY['smart-home', 'best-seller']),
    ('B08N5WRWNW', 'Echo Dot 4', 'Electronics', 35, 1749.65, '2025-05-24', '{"country": "US", "fbm": false}', ARRAY['smart-home', 'best-seller']),
    ('B08N5WRWNW', 'Echo Dot 4', 'Electronics', 42, 2099.58, '2025-05-25', '{"country": "US", "fbm": false}', ARRAY['smart-home', 'best-seller']),
    ('B0BDHWDR12', 'Kindle Paperwhite', 'Electronics', 20, 2799.80, '2025-05-23', '{"country": "US", "fbm": false}', ARRAY['e-reader']),
    ('B0BDHWDR12', 'Kindle Paperwhite', 'Electronics', 25, 3499.75, '2025-05-24', '{"country": "US", "fbm": false}', ARRAY['e-reader']),
    ('B07FZ8S74R', 'Yoga Mat', 'Sports', 100, 1999.00, '2025-05-23', '{"country": "UK", "fbm": true}', ARRAY['fitness', 'yoga']),
    ('B07FZ8S74R', 'Yoga Mat', 'Sports', 80, 1599.20, '2025-05-24', '{"country": "UK", "fbm": true}', ARRAY['fitness', 'yoga']);

-- ========== 3. 查询练习 ==========

-- Q1: 查询每个商品的总销量和总收入(按总收入排序)
SELECT 
    asin AS 商品编号,
    product_name AS 商品名称,
    SUM(units_sold) AS 总销量,
    SUM(revenue) AS 总收入,
    ROUND(AVG(revenue), 2) AS 日均收入
FROM amazon_sales
GROUP BY asin, product_name
ORDER BY 总收入 DESC;

-- Q2: 查询每天的销售汇总
SELECT 
    sale_date AS 日期,
    COUNT(DISTINCT asin) AS 商品数,
    SUM(units_sold) AS 总销量,
    SUM(revenue) AS 总收入
FROM amazon_sales
GROUP BY sale_date
ORDER BY sale_date;

-- Q3: 用 JSONB 查询 - 只看美国市场
SELECT 
    asin, product_name, units_sold, revenue
FROM amazon_sales
WHERE metadata @> '{"country": "US"}';

-- Q4: 用数组查询 - 包含 'best-seller' 标签的商品
SELECT 
    asin, product_name, tags
FROM amazon_sales
WHERE 'best-seller' = ANY(tags);

-- Q5: 复杂查询 - 计算每个商品的销量趋势(用窗口函数)
SELECT 
    asin,
    product_name,
    sale_date,
    units_sold,
    -- LAG: 获取上一行的值(同一商品的前一天销量)
    LAG(units_sold, 1) OVER (PARTITION BY asin ORDER BY sale_date) AS 前一天销量,
    -- 计算环比变化
    units_sold - LAG(units_sold, 1) OVER (PARTITION BY asin ORDER BY sale_date) AS 销量变化
FROM amazon_sales
ORDER BY asin, sale_date;