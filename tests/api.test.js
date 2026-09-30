const request = require('supertest');
const express = require('express');
const path = require('path');
const apiRoutes = require('../routes/api');
const logger = require('../middleware/logger');
const { notFoundHandler, errorHandler } = require('../middleware/errorHandler');

const app = express();
app.use(logger);
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

describe('API Routes', () => {
    describe('GET /api/search', () => {
        test('should return 400 without folder or query', async () => {
            const res = await request(app).get('/api/search');
            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        test('should return 400 with only folder', async () => {
            const res = await request(app).get('/api/search?folder=characters');
            expect(res.status).toBe(400);
        });

        test('should return data for a valid character search', async () => {
            const res = await request(app).get('/api/search?folder=characters&query=amber');
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
            expect(res.body.error).toBeUndefined();
        });

        test('should return aggregated result for folder=all', async () => {
            const res = await request(app).get('/api/search?folder=all&query=amber');
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/count', () => {
        test('should return 400 without folder', async () => {
            const res = await request(app).get('/api/count');
            expect(res.status).toBe(400);
        });

        test('should return count for a valid folder', async () => {
            const res = await request(app).get('/api/count?folder=characters');
            expect(res.status).toBe(200);
            expect(res.body.folder).toBe('characters');
            expect(typeof res.body.count).toBe('number');
        });

        test('should return count for all folders', async () => {
            const res = await request(app).get('/api/count?folder=all');
            expect(res.status).toBe(200);
            expect(res.body.count).toBeGreaterThan(0);
        });
    });

    describe('GET /api/folders', () => {
        test('should return a list of folders', async () => {
            const res = await request(app).get('/api/folders');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.folders)).toBe(true);
            expect(res.body.folders.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/search-index', () => {
        test('should return 400 without q parameter', async () => {
            const res = await request(app).get('/api/search-index');
            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        test('should return 400 with empty q', async () => {
            const res = await request(app).get('/api/search-index?q=');
            expect(res.status).toBe(400);
        });

        test('should return ranked results for a valid query', async () => {
            const res = await request(app).get('/api/search-index?q=amber');
            expect(res.status).toBe(200);
            expect(typeof res.body.total).toBe('number');
            expect(res.body.total).toBeGreaterThan(0);
            expect(Array.isArray(res.body.results)).toBe(true);
            expect(res.body.results.length).toBeGreaterThan(0);
        });

        test('results should have score, folder, nameEn, nameZh fields', async () => {
            const res = await request(app).get('/api/search-index?q=zhongli');
            expect(res.status).toBe(200);
            const item = res.body.results[0];
            expect(item).toHaveProperty('score');
            expect(item).toHaveProperty('folder');
            expect(item).toHaveProperty('nameEn');
            expect(item).toHaveProperty('nameZh');
        });

        test('should support folder filter', async () => {
            const res = await request(app).get('/api/search-index?q=amber&folder=weapons');
            expect(res.status).toBe(200);
            expect(res.body.results.every(r => r.folder === 'weapons')).toBe(true);
        });

        test('should support limit parameter', async () => {
            const res = await request(app).get('/api/search-index?q=a&limit=3');
            expect(res.status).toBe(200);
            expect(res.body.results.length).toBeLessThanOrEqual(3);
        });

        test('should return empty results for non-matching query', async () => {
            const res = await request(app).get('/api/search-index?q=zzzznotexistzzzz');
            expect(res.status).toBe(200);
            expect(res.body.total).toBe(0);
            expect(res.body.results).toEqual([]);
        });
    });

    describe('GET /api/changelog', () => {
        test('should return changelog with releases array', async () => {
            const res = await request(app).get('/api/changelog');
            expect(res.status).toBe(200);
            expect(typeof res.body.total).toBe('number');
            expect(Array.isArray(res.body.releases)).toBe(true);
        });

        test('should include v1.1.0 release', async () => {
            const res = await request(app).get('/api/changelog');
            const release = res.body.releases.find(r => r.version === '1.1.0');
            expect(release).toBeDefined();
            expect(release.tag).toBe('v1.1.0');
            expect(release.content).toContain('搜索');
        });
    });

    describe('GET /api/list', () => {
        test('should return 400 without folder', async () => {
            const res = await request(app).get('/api/list');
            expect(res.status).toBe(400);
        });

        test('should return names for a valid folder', async () => {
            const res = await request(app).get('/api/list?folder=characters');
            expect(res.status).toBe(200);
            expect(res.body.folder).toBe('characters');
            expect(Array.isArray(res.body.names)).toBe(true);
            expect(res.body.names.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/category/:folder', () => {
        test('should return 400 for an invalid folder', async () => {
            const res = await request(app).get('/api/category/invalidfolder');
            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        test('should return paginated items for a valid folder', async () => {
            const res = await request(app).get('/api/category/characters?page=1&pageSize=5');
            expect(res.status).toBe(200);
            expect(res.body.folder).toBe('characters');
            expect(res.body.page).toBe(1);
            expect(res.body.pageSize).toBe(5);
            expect(typeof res.body.total).toBe('number');
            expect(res.body.total).toBeGreaterThan(0);
            expect(typeof res.body.totalPages).toBe('number');
            expect(res.body.totalPages).toBeGreaterThan(0);
            expect(Array.isArray(res.body.items)).toBe(true);
            expect(res.body.items.length).toBeLessThanOrEqual(5);
        });

        test('should return items with summary fields', async () => {
            const res = await request(app).get('/api/category/characters?page=1&pageSize=1');
            expect(res.status).toBe(200);
            expect(res.body.items.length).toBe(1);
            const item = res.body.items[0];
            expect(item.name).toBeDefined();
            expect(item.images).toBeDefined();
        });

        test('should use default pagination when not specified', async () => {
            const res = await request(app).get('/api/category/weapons');
            expect(res.status).toBe(200);
            expect(res.body.page).toBe(1);
            expect(res.body.pageSize).toBe(24);
        });

        test('should clamp page number beyond range', async () => {
            const res = await request(app).get('/api/category/characters?page=99999');
            expect(res.status).toBe(200);
            expect(res.body.page).toBeLessThanOrEqual(res.body.totalPages);
        });
    });

    describe('GET /api/item/:folder/:name', () => {
        test('should return 400 for an invalid folder', async () => {
            const res = await request(app).get('/api/item/invalidfolder/something');
            expect(res.status).toBe(400);
        });

        test('should return detail data for a valid item', async () => {
            const res = await request(app).get('/api/item/characters/amber');
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
            expect(res.body.error).toBeUndefined();
            expect(res.body.name).toBeDefined();
        });

        test('should return error for non-existent item', async () => {
            const res = await request(app).get('/api/item/characters/zzzznotexistzzzz');
            expect(res.status).toBe(200);
            expect(res.body.error).toBeDefined();
        });

        test('should support resultLanguage parameter', async () => {
            const res = await request(app).get('/api/item/characters/amber?resultLanguage=English');
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Amber');
        });
    });

    describe('404 handler', () => {
        test('should return 404 for unknown routes', async () => {
            const res = await request(app).get('/nonexistent');
            expect(res.status).toBe(404);
            expect(res.body.error).toBeDefined();
        });
    });
});
