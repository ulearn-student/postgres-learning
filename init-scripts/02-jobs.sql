-- 文件: init-scripts/02-jobs.sql
-- 职位信息表

CREATE TABLE IF NOT EXISTS jobs (
    id          BIGSERIAL PRIMARY KEY,
    
    -- 职位基本信息
    title       TEXT NOT NULL,                    -- 职位名称
    company     TEXT NOT NULL,                    -- 公司名称
    
    -- 薪资（拆成三个字段，方便筛选排序）
    salary_text TEXT,                             -- 原始薪资文本，如 "15k-25k"
    salary_min  INT,                              -- 薪资下限（单位：千）
    salary_max  INT,                              -- 薪资上限（单位：千）
    
    -- 地点和要求
    city        TEXT,                             -- 城市
    district    TEXT,                             -- 区域，如"南山区"
    experience  TEXT,                             -- 经验要求，如"3-5年"
    education   TEXT,                             -- 学历要求，如"本科"
    
    -- 公司信息
    company_size    TEXT,                         -- 公司规模，如"500-999人"
    company_type    TEXT,                         -- 公司类型，如"互联网"
    company_stage   TEXT,                         -- 融资阶段，如"C轮"
    
    -- 其他
    tags        TEXT[],                           -- 职位标签数组
    description TEXT,                             -- 职位详情
    url         TEXT UNIQUE,                      -- 职位链接（唯一，防止重复插入）
    published_at TEXT,                            -- 发布时间
    source      TEXT DEFAULT 'boss',              -- 数据来源
    
    -- 系统字段
    created_at  TIMESTAMPTZ DEFAULT NOW(),        -- 爬取时间
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 索引（加快常用查询）
CREATE INDEX IF NOT EXISTS idx_jobs_title    ON jobs(title);
CREATE INDEX IF NOT EXISTS idx_jobs_city     ON jobs(city);
CREATE INDEX IF NOT EXISTS idx_jobs_salary   ON jobs(salary_min, salary_max);
CREATE INDEX IF NOT EXISTS idx_jobs_created  ON jobs(created_at DESC);

-- 插入几条测试数据（模拟爬虫结果）
INSERT INTO jobs (title, company, salary_text, salary_min, salary_max, city, district, experience, education, company_size, company_type, tags, url) VALUES
    ('亚马逊运营专员', '深圳某跨境电商', '8k-15k', 8, 15, '深圳', '南山区', '1-3年', '大专', '100-499人', '跨境电商', ARRAY['五险一金', '带薪年假', '扁平管理'], 'https://www.zhipin.com/job/001'),
    ('亚马逊运营经理', '广州跨境科技', '15k-25k', 15, 25, '广州', '天河区', '3-5年', '本科', '500-999人', '跨境电商', ARRAY['五险一金', '年终奖', '期权'], 'https://www.zhipin.com/job/002'),
    ('跨境电商运营', '义乌贸易公司', '6k-10k', 6, 10, '义乌', '稠城街道', '1年以内', '大专', '20-99人', '贸易', ARRAY['包住', '提成'], 'https://www.zhipin.com/job/003'),
    ('Amazon运营', '深圳品牌出海', '12k-20k', 12, 20, '深圳', '福田区', '1-3年', '本科', '100-499人', '跨境电商', ARRAY['五险一金', '下午茶', '团建'], 'https://www.zhipin.com/job/004'),
    ('亚马逊店铺运营', '杭州电商公司', '10k-18k', 10, 18, '杭州', '滨江区', '3-5年', '本科', '500-999人', '电商', ARRAY['六险一金', '年终奖'], 'https://www.zhipin.com/job/005')
ON CONFLICT (url) DO NOTHING;
-- ON CONFLICT: 如果 url 已存在就跳过，不报错（防重复）

SELECT '✅ jobs 表创建完成，已插入' || COUNT(*) || '条测试数据' AS result FROM jobs;