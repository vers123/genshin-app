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

    describe('404 handler', () => {
        test('should return 404 for unknown routes', async () => {
            const res = await request(app).get('/nonexistent');
            expect(res.status).toBe(404);
            expect(res.body.error).toBeDefined();
        });
    });
});
