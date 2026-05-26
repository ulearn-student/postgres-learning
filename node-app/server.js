const express = require('express');
const path = require('path');
const userRepo = require('./userRepository');
const { withTransaction } = require('./transaction');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));  // 静态文件目录

// ========== 健康检查 ==========
app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'ok',
            time: result.rows[0].now,
            pool: { total: pool.totalCount, idle: pool.idleCount }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== 职位 API ==========

// 获取所有职位（带筛选+搜索+分页）
app.get('/api/jobs', async (req, res) => {
    try {
        const { 
            search = '', 
            city = '', 
            minSalary = 0, 
            page = 1, 
            pageSize = 20,
            sortBy = 'created_at'
        } = req.query;
        
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        
        if (search) {
            conditions.push(`(title ILIKE $${paramIndex} OR company ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        if (city) {
            conditions.push(`city = $${paramIndex}`);
            params.push(city);
            paramIndex++;
        }
        
        if (minSalary > 0) {
            conditions.push(`salary_min >= $${paramIndex}`);
            params.push(parseInt(minSalary));
            paramIndex++;
        }
        
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        
        const validSortFields = ['created_at', 'salary_min', 'salary_max'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM jobs ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);
        
        const offset = (page - 1) * pageSize;
        const dataSQL = `
            SELECT id, title, company, salary_text, salary_min, salary_max,
                   city, district, experience, education, company_size,
                   company_type, company_stage, tags, description, url,
                   published_at, created_at
            FROM jobs
            ${whereClause}
            ORDER BY ${sortField} DESC NULLS LAST
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        const dataResult = await pool.query(dataSQL, [...params, pageSize, offset]);
        
        res.json({
            data: dataResult.rows.map(row => ({
                ...row,
                id: row.id.toString()
            })),
            pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 统计数据
app.get('/api/jobs/stats', async (req, res) => {
    try {
        const totalResult = await pool.query('SELECT COUNT(*) FROM jobs');
        const cityResult = await pool.query(`
            SELECT city, COUNT(*) AS count
            FROM jobs
            GROUP BY city
            ORDER BY count DESC
        `);
        const salaryResult = await pool.query(`
            SELECT 
                ROUND(AVG(salary_min)) AS avg_min,
                ROUND(AVG(salary_max)) AS avg_max,
                MAX(salary_max) AS max_salary
            FROM jobs
            WHERE salary_min IS NOT NULL
        `);
        const cityCount = await pool.query('SELECT COUNT(DISTINCT city) FROM jobs');
        
        res.json({
            total: parseInt(totalResult.rows[0].count),
            cityCount: parseInt(cityCount.rows[0].count),
            avgSalaryMin: parseInt(salaryResult.rows[0].avg_min) || 0,
            avgSalaryMax: parseInt(salaryResult.rows[0].avg_max) || 0,
            maxSalary: parseInt(salaryResult.rows[0].max_salary) || 0,
            cities: cityResult.rows.map(r => ({ city: r.city, count: parseInt(r.count) }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取所有城市列表
app.get('/api/jobs/cities', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT city FROM jobs WHERE city IS NOT NULL ORDER BY city
        `);
        res.json(result.rows.map(r => r.city));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 服务器启动: http://localhost:${PORT}`);
});