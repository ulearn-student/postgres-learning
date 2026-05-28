// 文件: middleware-auth.js
// 认证中间件 - 保护需要登录才能访问的接口

const { verifyToken } = require('./utils-auth');

// 这个函数会在受保护的接口前执行,检查请求是否带了有效 token
function authMiddleware(req, res, next) {
    // 1. 从请求头取出 token
    // 标准格式: Authorization: Bearer eyJhbGci...
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: '请先登录(缺少认证信息)' });
    }
    
    // 2. 分离出 token(去掉前面的 "Bearer ")
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'token 格式错误' });
    }
    
    // 3. 验证 token
    const result = verifyToken(token);
    
    if (!result.valid) {
        return res.status(401).json({ error: '登录已过期,请重新登录' });
    }
    
    // 4. 验证通过!把用户信息挂到 req 上,后续接口可以用
    req.user = result.data;
    // 现在接口里可以通过 req.user.userId 知道是谁在操作
    
    // 5. 放行,继续执行下一步
    next();
}

module.exports = authMiddleware;