const pool = require('./db');

async function findAll() {
    const sql = `
        SELECT id, username, email, age, created_at 
        FROM users 
        ORDER BY created_at DESC
    `;
    const result = await pool.query(sql);
    return result.rows;
}

async function findById(id) {
    const sql = `
        SELECT id, username, email, age, created_at 
        FROM users 
        WHERE id = $1
    `;
    const result = await pool.query(sql, [id]);
    return result.rows[0] || null;
}

async function findByEmail(email) {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0] || null;
}

async function create(userData) {
    const { username, email, password_hash, age } = userData;
    const sql = `
        INSERT INTO users (username, email, password_hash, age)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, email, age, created_at
    `;
    try {
        const result = await pool.query(sql, [username, email, password_hash, age]);
        return result.rows[0];
    } catch (error) {
        if (error.code === '23505') {
            throw new Error('Email 或用户名已被注册');
        }
        throw error;
    }
}

async function update(id, updates) {
    const allowedFields = ['username', 'email', 'age'];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            setClauses.push(`${field} = $${paramIndex}`);
            values.push(updates[field]);
            paramIndex++;
        }
    }

    if (setClauses.length === 0) {
        throw new Error('没有提供要更新的字段');
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
        UPDATE users 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, username, email, age, updated_at
    `;

    const result = await pool.query(sql, values);
    return result.rows[0] || null;
}

async function deleteById(id) {
    const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rowCount > 0;
}

async function findWithPagination({ page = 1, pageSize = 10, search = '' }) {
    const offset = (page - 1) * pageSize;
    let whereClause = '';
    const params = [];

    if (search) {
        whereClause = 'WHERE username ILIKE $1 OR email ILIKE $1';
        params.push(`%${search}%`);
    }

    const countSQL = `SELECT COUNT(*) FROM users ${whereClause}`;
    const countResult = await pool.query(countSQL, params);
    const total = parseInt(countResult.rows[0].count);

    const dataSQL = `
        SELECT id, username, email, age, created_at 
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataResult = await pool.query(dataSQL, [...params, pageSize, offset]);

    return {
        data: dataResult.rows,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    };
}

module.exports = {
    findAll,
    findById,
    findByEmail,
    create,
    update,
    deleteById,
    findWithPagination
};