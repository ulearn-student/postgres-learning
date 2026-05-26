const pool = require('./db');

// 模拟爬虫抓取的原始数据
function mockCrawlJobs() {
    console.log('🕷️  开始爬取数据...');
    return [
        {
            title: 'Amazon运营专员',
            company: 'Shenzhen Cross-Border Co.',
            salary: '10k-18k',
            city: 'Shenzhen',
            district: 'Nanshan',
            experience: '1-3years',
            education: 'College',
            companySize: '100-499',
            companyType: 'E-commerce',
            companyStage: 'Series A',
            tags: ['social insurance', 'paid leave', 'bonus'],
            description: 'Amazon store operations, listing optimization, PPC advertising. Helium10 preferred.',
            url: `https://www.zhipin.com/job/${Date.now()}_1`,
            publishedAt: 'just now'
        },
        {
            title: 'Amazon Operations Manager',
            company: 'Guangzhou Brand Global Tech',
            salary: '20k-35k',
            city: 'Guangzhou',
            district: 'Tianhe',
            experience: '3-5years',
            education: 'Bachelor',
            companySize: '500-999',
            companyType: 'Internet',
            companyStage: 'Series C',
            tags: ['full insurance', 'equity', 'remote work'],
            description: 'Lead operations team, manage Amazon brand strategy, ad budget, new product development.',
            url: `https://www.zhipin.com/job/${Date.now()}_2`,
            publishedAt: '3 days ago'
        },
        {
            title: 'Cross-border E-commerce Operator',
            company: 'Yiwu Trading Company',
            salary: '6k-10k',
            city: 'Yiwu',
            district: 'Choucheng',
            experience: 'Fresh graduate',
            education: 'College',
            companySize: '20-99',
            companyType: 'Trading',
            companyStage: 'No funding',
            tags: ['accommodation', 'commission', 'training'],
            description: 'Handle Amazon product listings, order processing, customer service replies.',
            url: `https://www.zhipin.com/job/${Date.now()}_3`,
            publishedAt: '1 day ago'
        },
        {
            title: 'Amazon PPC Specialist',
            company: 'Shenzhen Laotie Tech',
            salary: '15k-25k',
            city: 'Shenzhen',
            district: 'Futian',
            experience: '1-3years',
            education: 'Bachelor',
            companySize: '100-499',
            companyType: 'E-commerce',
            companyStage: 'Series B',
            tags: ['social insurance', 'snacks', 'team building', 'stock options'],
            description: 'Focus on Amazon PPC optimization, manage SP/SB/SD ad types independently.',
            url: `https://www.zhipin.com/job/${Date.now()}_4`,
            publishedAt: 'today'
        },
        {
            title: 'Amazon Operator (No experience needed)',
            company: 'Hangzhou E-commerce Training',
            salary: '4k-6k',
            city: 'Hangzhou',
            district: 'Yuhang',
            experience: 'Student',
            education: 'Bachelor',
            companySize: '20-99',
            companyType: 'Education',
            companyStage: 'No funding',
            tags: ['internship', 'flexible hours'],
            description: 'Intern position, assist senior operators with daily tasks.',
            url: `https://www.zhipin.com/job/${Date.now()}_5`,
            publishedAt: 'just now'
        }
    ];
}

// 解析薪资文本 "10k-18k" => { min: 10, max: 18 }
function parseSalary(salaryText) {
    if (!salaryText) return { min: null, max: null };
    const match = salaryText.match(/(\d+)[kK]?[-~](\d+)[kK]?/);
    if (!match) return { min: null, max: null };
    let min = parseInt(match[1]);
    let max = parseInt(match[2]);
    if (min > 1000) min = Math.round(min / 1000);
    if (max > 1000) max = Math.round(max / 1000);
    return { min, max };
}

// 存入数据库
async function saveJobs(jobs) {
    console.log(`\n💾 开始存入数据库，共 ${jobs.length} 条...\n`);
    let successCount = 0;
    let updateCount = 0;
    let errorCount = 0;

    for (const job of jobs) {
        try {
            const salary = parseSalary(job.salary);
            const sql = `
                INSERT INTO jobs (
                    title, company,
                    salary_text, salary_min, salary_max,
                    city, district, experience, education,
                    company_size, company_type, company_stage,
                    tags, description, url, published_at
                ) VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9,
                    $10, $11, $12,
                    $13, $14, $15, $16
                )
                ON CONFLICT (url)
                DO UPDATE SET
                    title       = EXCLUDED.title,
                    salary_text = EXCLUDED.salary_text,
                    salary_min  = EXCLUDED.salary_min,
                    salary_max  = EXCLUDED.salary_max,
                    updated_at  = NOW()
                RETURNING id, title, (xmax = 0) AS is_new
            `;

            const result = await pool.query(sql, [
                job.title, job.company,
                job.salary, salary.min, salary.max,
                job.city, job.district, job.experience, job.education,
                job.companySize, job.companyType, job.companyStage,
                job.tags, job.description, job.url, job.publishedAt
            ]);

            const isNew = result.rows[0].is_new;
            if (isNew) {
                console.log(`  ✅ 新增: [${job.city}] ${job.title} @ ${job.company} | ${job.salary}`);
                successCount++;
            } else {
                console.log(`  🔄 更新: [${job.city}] ${job.title} @ ${job.company}`);
                updateCount++;
            }
        } catch (error) {
            console.error(`  ❌ 失败: ${job.title} - ${error.message}`);
            errorCount++;
        }
    }
    console.log(`\n📊 结果: 新增 ${successCount} | 更新 ${updateCount} | 失败 ${errorCount}`);
}

// 查询分析
async function analyzeJobs() {
    console.log('\n========== 📈 数据分析 ==========\n');

    const cityStats = await pool.query(`
        SELECT city, COUNT(*) AS job_count,
               ROUND(AVG(salary_min)) AS avg_salary_min,
               ROUND(AVG(salary_max)) AS avg_salary_max
        FROM jobs
        WHERE salary_min IS NOT NULL
        GROUP BY city
        ORDER BY job_count DESC
    `);
    console.log('【按城市统计】');
    console.table(cityStats.rows);

    const highSalary = await pool.query(`
        SELECT title, company, salary_text, city
        FROM jobs
        WHERE salary_min >= 15
        ORDER BY salary_min DESC
    `);
    console.log('【高薪职位 15k+】');
    console.table(highSalary.rows);

    const keyword = 'Helium10';
    const search = await pool.query(`
        SELECT title, company, salary_text
        FROM jobs
        WHERE description ILIKE $1
    `, [`%${keyword}%`]);
    console.log(`【描述包含 "${keyword}" 的职位】`);
    console.table(search.rows);
}

async function main() {
    try {
        const rawJobs = mockCrawlJobs();
        console.log(`✅ 爬取完成，共 ${rawJobs.length} 条`);
        await saveJobs(rawJobs);
        await analyzeJobs();
    } catch (error) {
        console.error('💥 出错:', error);
    } finally {
        await pool.end();
        console.log('\n✅ 完成');
    }
}

main();