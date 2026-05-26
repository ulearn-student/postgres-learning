const pool = require('./db');

function mockJobs() {
    const baseTime = Date.now();
    return [
        {
            title: '亚马逊运营专员',
            company: '深圳跨境通电商有限公司',
            salary: '10k-18k',
            city: '深圳',
            district: '南山区',
            experience: '1-3年',
            education: '大专',
            companySize: '100-499人',
            companyType: '跨境电商',
            companyStage: 'A轮',
            tags: ['五险一金', '带薪年假', '年终奖', '加班补助'],
            description: '负责亚马逊店铺日常运营，包括Listing优化、广告投放、数据分析等。熟悉Helium10、Jungle Scout优先。',
            url: `https://www.zhipin.com/job/${baseTime}_1`,
            publishedAt: '刚刚发布'
        },
        {
            title: 'Amazon运营经理',
            company: '广州品牌出海科技',
            salary: '20k-35k',
            city: '广州',
            district: '天河区',
            experience: '3-5年',
            education: '本科',
            companySize: '500-999人',
            companyType: '互联网',
            companyStage: 'C轮',
            tags: ['六险一金', '股票期权', '弹性工作', '远程办公'],
            description: '带领运营团队制定亚马逊品牌战略，管理广告预算，负责新品开发和市场拓展。',
            url: `https://www.zhipin.com/job/${baseTime}_2`,
            publishedAt: '3天前'
        },
        {
            title: '跨境电商运营（亚马逊方向）',
            company: '义乌外贸有限公司',
            salary: '6k-10k',
            city: '义乌',
            district: '稠城街道',
            experience: '应届生',
            education: '大专',
            companySize: '20-99人',
            companyType: '外贸',
            companyStage: '不需要融资',
            tags: ['包住宿', '提成丰厚', '带薪培训'],
            description: '应届生可接受，负责亚马逊平台产品上架、订单处理、客服回复等基础运营工作。',
            url: `https://www.zhipin.com/job/${baseTime}_3`,
            publishedAt: '1天前'
        },
        {
            title: '亚马逊广告运营',
            company: '深圳老铁科技有限公司',
            salary: '15k-25k',
            city: '深圳',
            district: '福田区',
            experience: '1-3年',
            education: '本科',
            companySize: '100-499人',
            companyType: '跨境电商',
            companyStage: 'B轮',
            tags: ['五险一金', '下午茶', '团建活动', '股票期权'],
            description: '专注亚马逊PPC广告优化，有独立管理广告账户经验，熟悉SP/SB/SD广告类型。',
            url: `https://www.zhipin.com/job/${baseTime}_4`,
            publishedAt: '今天'
        },
        {
            title: '亚马逊运营实习生',
            company: '杭州跨境电商培训机构',
            salary: '4k-6k',
            city: '杭州',
            district: '余杭区',
            experience: '在校生',
            education: '本科',
            companySize: '20-99人',
            companyType: '教育培训',
            companyStage: '未融资',
            tags: ['实习生', '弹性工作', '导师带教'],
            description: '实习生岗位，协助运营老师完成日常任务，提供完整的亚马逊运营培训。',
            url: `https://www.zhipin.com/job/${baseTime}_5`,
            publishedAt: '刚刚发布'
        },
        {
            title: '亚马逊高级运营',
            company: '深圳安克创新',
            salary: '25k-40k',
            city: '深圳',
            district: '南山区',
            experience: '5-10年',
            education: '本科',
            companySize: '1000-9999人',
            companyType: '上市公司',
            companyStage: '已上市',
            tags: ['六险一金', '股票期权', '年终奖', '免费三餐', '健身房'],
            description: '负责亚马逊核心品类运营，对接全球供应链，制定运营策略和KPI指标。',
            url: `https://www.zhipin.com/job/${baseTime}_6`,
            publishedAt: '2天前'
        },
        {
            title: '亚马逊listing优化专员',
            company: '东莞外贸科技',
            salary: '8k-14k',
            city: '东莞',
            district: '南城区',
            experience: '1-3年',
            education: '大专',
            companySize: '100-499人',
            companyType: '跨境电商',
            companyStage: '天使轮',
            tags: ['五险一金', '免费工作餐', '生日福利'],
            description: '负责亚马逊产品Listing文案撰写、关键词优化、A+页面设计等工作。',
            url: `https://www.zhipin.com/job/${baseTime}_7`,
            publishedAt: '今天'
        },
        {
            title: '亚马逊运营总监',
            company: '上海跨境电商集团',
            salary: '40k-60k',
            city: '上海',
            district: '浦东新区',
            experience: '10年以上',
            education: '本科',
            companySize: '1000-9999人',
            companyType: '上市公司',
            companyStage: '已上市',
            tags: ['六险一金', '股票期权', '年终奖', '高管补贴', '配车'],
            description: '负责整个亚马逊事业部的战略规划、团队管理、业绩达成，向CEO汇报。',
            url: `https://www.zhipin.com/job/${baseTime}_8`,
            publishedAt: '1周前'
        }
    ];
}

function parseSalary(text) {
    if (!text) return { min: null, max: null };
    const match = text.match(/(\d+)[kK]?[-~](\d+)[kK]?/);
    if (!match) return { min: null, max: null };
    let min = parseInt(match[1]);
    let max = parseInt(match[2]);
    if (min > 1000) min = Math.round(min / 1000);
    if (max > 1000) max = Math.round(max / 1000);
    return { min, max };
}

async function main() {
    try {
        console.log('🧹 清空旧数据...');
        await pool.query('TRUNCATE TABLE jobs RESTART IDENTITY');

        const jobs = mockJobs();
        console.log(`💾 插入 ${jobs.length} 条新数据...`);

        for (const job of jobs) {
            const salary = parseSalary(job.salary);
            await pool.query(`
                INSERT INTO jobs (
                    title, company, salary_text, salary_min, salary_max,
                    city, district, experience, education,
                    company_size, company_type, company_stage,
                    tags, description, url, published_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            `, [
                job.title, job.company, job.salary, salary.min, salary.max,
                job.city, job.district, job.experience, job.education,
                job.companySize, job.companyType, job.companyStage,
                job.tags, job.description, job.url, job.publishedAt
            ]);
            console.log(`  ✅ ${job.title} @ ${job.company}`);
        }

        console.log('🎉 完成！');
    } catch (error) {
        console.error('💥 错误:', error.message);
    } finally {
        await pool.end();
    }
}

main();