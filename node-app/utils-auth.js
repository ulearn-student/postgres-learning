// 文件: utils-auth.js
// JWT 认证工具模块 - 封装密码加密和 token 生成/验证

const jwt = require('jsonwebtoken');   // JWT 库
const bcrypt = require('bcrypt');       // 密码加密库

// ===== 密钥配置 =====
// 生产环境要放在 .env 里,这里为了演示先写死
// 这个密钥用来给 JWT 签名,泄露了别人就能伪造 token
const JWT_SECRET = 'delta-buddy-secret-key-2026';

// Token 有效期(7天后用户需要重新登录)
const JWT_EXPIRES = '7d';

// ===== 1. 密码加密 =====
// 注册时调用,把明文密码变成无法反推的哈希值
async function hashPassword(plainPassword) {
    // saltRounds = 10: 加密强度(越高越安全但越慢,10 是推荐值)
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    return hash;
    // 返回类似: "$2b$10$N9qo8uLOickgx2ZMRZoMye..."
}

// ===== 2. 密码验证 =====
// 登录时调用,对比用户输入的密码和数据库里的哈希值
async function verifyPassword(plainPassword, hashedPassword) {
    // bcrypt 会自动处理对比逻辑,返回 true/false
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
}

// ===== 3. 生成 JWT =====
// 登录成功后调用,给用户发一张"电子身份证"
function generateToken(payload) {
    // payload: 要存进 token 的用户信息,比如 { userId: 1, username: '张三' }
    // ⚠️ 绝不要把密码放进 payload!因为 payload 是可以被解开看的
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return token;
}

// ===== 4. 验证 JWT =====
// 每次请求受保护接口时调用,检查 token 是否有效
function verifyToken(token) {
    try {
        // 验证签名 + 是否过期,通过则返回 payload
        const decoded = jwt.verify(token, JWT_SECRET);
        return { valid: true, data: decoded };
    } catch (error) {
        // token 无效、被篡改、过期都会进这里
        return { valid: false, error: error.message };
    }
}

// 导出所有函数
module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken
};