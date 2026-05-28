// 文件: auth-server.js
// 带 JWT 认证的完整服务器

const express = require('express');
const pool = require('./db');
const { hashPassword, verifyPassword, generateToken } = require('./utils-auth');
const authMiddleware = require('./middleware-auth');

const app = express();
const PORT = 3001;  // 用 3001 避免和之前的 server.js 冲突

app.use(express.json());

// ============ 1. 注册接口(公开,不需要登录)============
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 基础校验
        if (!username || !email || !password) {
            return res.status(400).json({ error: '用户名、邮箱、密码都不能为空' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: '密码至少 6 位' });
        }
        
        // 关键!把明文密码加密成哈希值
        const passwordHash = await hashPassword(password);
        
        // 存入数据库(存的是加密后的哈希,不是明文)
        const result = await pool.query(`
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, username, email, created_at
        `, [username, email, passwordHash]);
        
        const user = result.rows[0];
        
        // 注册成功后直接生成 token,让用户免去再登录一次
        const token = generateToken({ userId: user.id.toString() });
        res.status(201).json({
            message: '注册成功',
            user: { id: user.id.toString(), username: user.username, email: user.email },
            token  // 把 token 返回给前端
        });
        
    } catch (error) {
        if (error.code === '23505') {  // 唯一约束冲突
            return res.status(409).json({ error: '用户名或邮箱已被注册' });
        }
        res.status(500).json({ error: error.message });
    }
});

// ============ 2. 登录接口(公开)============
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: '邮箱和密码不能为空' });
        }
        
        // 根据邮箱找用户
        const result = await pool.query(
            'SELECT id, username, email, password_hash FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            // 注意:不要提示"用户不存在",统一说"账号或密码错误"
            // 否则黑客能用这个接口探测哪些邮箱注册过
            return res.status(401).json({ error: '账号或密码错误' });
        }
        
        const user = result.rows[0];
        
        // 关键!用 bcrypt 对比密码
        const isMatch = await verifyPassword(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: '账号或密码错误' });
        }
        
        // 密码正确,生成 token
        const token = generateToken({ userId: user.id.toString(), username: user.username });
        
        res.json({
            message: '登录成功',
            user: { id: user.id.toString(), username: user.username, email: user.email },
            token
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ 3. 受保护接口(需要登录)============
// 注意第二个参数 authMiddleware,这就是"门卫"
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        // req.user 是中间件挂上去的,包含 token 里的用户信息
        const userId = req.user.userId;
        
        const result = await pool.query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1',
            [userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }
        
        const user = result.rows[0];
        res.json({
            id: user.id.toString(),
            username: user.username,
            email: user.email,
            created_at: user.created_at
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ 4. 对比:不受保护的接口 ============
app.get('/api/public/info', (req, res) => {
    res.json({ message: '这是公开信息,谁都能看' });
});

app.listen(PORT, () => {
    console.log(`🚀 认证服务器启动: http://localhost:${PORT}`);
    console.log(`📝 注册: POST /api/auth/register`);
    console.log(`🔑 登录: POST /api/auth/login`);
    console.log(`🔒 受保护: GET /api/auth/me (需要 token)`);
});