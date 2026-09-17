const express = require('express');
const router = express.Router();
const GenshinService = require('../services/genshinService');
const config = require('../config');

router.get('/search', (req, res) => {
    const { folder, query, resultLanguage } = req.query;
    if (!folder || !query) {
        return res.status(400).json({ error: 'Missing required parameter: folder or query' });
    }

    if (folder === 'all') {
        const result = GenshinService.searchAll(query, resultLanguage);
        if (result) return res.json(result);
        return res.json({ error: `No matches found for "${query}"` });
    }

    const result = GenshinService.search(folder, query, resultLanguage);
    if (result) return res.json(result);
    res.json({ error: `"${query}" not found in "${folder}"` });
});

router.get('/count', (req, res) => {
    const { folder } = req.query;
    if (!folder) return res.status(400).json({ error: 'Missing required parameter: folder' });

    const count = GenshinService.getCount(folder);
    if (count === null) return res.json({ error: `Invalid category: "${folder}"` });
    res.json({ folder, count });
});

router.get('/folders', (_req, res) => {
    res.json({ folders: GenshinService.getFolders() });
});

router.get('/list', (req, res) => {
    const { folder, resultLanguage } = req.query;
    if (!folder) return res.status(400).json({ error: 'Missing required parameter: folder' });

    const names = GenshinService.listNames(folder, resultLanguage);
    if (names === null) return res.json({ error: `Invalid category: "${folder}"` });
    res.json({ folder, names });
});

router.get('/category/:folder', (req, res) => {
    const { folder } = req.params;
    const page = parseInt(req.query.page, 10) || config.defaultPage;
    const pageSize = parseInt(req.query.pageSize, 10) || config.defaultPageSize;
    const { resultLanguage } = req.query;

    const result = GenshinService.getCategoryItems(folder, page, pageSize, resultLanguage);
    if (result === null) return res.status(400).json({ error: `Invalid category: "${folder}"` });
    res.json(result);
});

router.get('/item/:folder/:name', (req, res) => {
    const { folder, name } = req.params;
    const { resultLanguage } = req.query;

    if (!config.folders.includes(folder))
        return res.status(400).json({ error: `Invalid category: "${folder}"` });

    const result = GenshinService.getItemDetail(folder, name, resultLanguage);
    if (result === null) return res.json({ error: `"${name}" not found in "${folder}"` });
    res.json(result);
});

module.exports = router;
