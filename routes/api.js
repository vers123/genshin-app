const express = require('express');
const router = express.Router();
const GenshinService = require('../services/genshinService');

// 查询接口
router.get('/search', (req, res) => {
    const { folder, query, resultLanguage } = req.query;
    if (!folder || !query) {
        return res.status(400).json({ error: '缺少 folder 或 query 参数' });
    }

    if (folder === 'all') {
        const result = GenshinService.searchAll(query, resultLanguage);
        if (result) return res.json(result);
        return res.json({ error: `未找到与 "${query}" 匹配的数据` });
    }

    const result = GenshinService.search(folder, query, resultLanguage);
    if (result) return res.json(result);
    res.json({ error: `在 "${folder}" 中未找到 "${query}"` });
});

// 总数接口
router.get('/count', (req, res) => {
    const { folder } = req.query;
    if (!folder) return res.status(400).json({ error: '缺少 folder 参数' });

    const count = GenshinService.getCount(folder);
    if (count === null) return res.json({ error: `无效的分类: "${folder}"` });
    res.json({ folder, count });
});

module.exports = router;