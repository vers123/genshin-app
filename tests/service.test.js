const GenshinService = require('../services/genshinService');

describe('GenshinService', () => {
    describe('search', () => {
        test('should return data for a valid character query', () => {
            const result = GenshinService.search('characters', 'amber');
            expect(result).toBeDefined();
            expect(result).not.toBeNull();
        });

        test('should return null for an invalid folder', () => {
            const result = GenshinService.search('invalidfolder', 'amber');
            expect(result).toBeNull();
        });

        test('should support resultLanguage parameter', () => {
            const result = GenshinService.search('characters', 'amber', 'English');
            expect(result).toBeDefined();
            expect(result).not.toBeNull();
        });
    });

    describe('searchAll', () => {
        test('should return aggregated result for a common query', () => {
            const result = GenshinService.searchAll('amber');
            expect(result).toBeDefined();
            expect(result).not.toBeNull();
            expect(result.type).toBe('aggregated');
            expect(result.results).toBeDefined();
            expect(result.total).toBeGreaterThan(0);
        });

        test('should return null for a non-matching query', () => {
            const result = GenshinService.searchAll('zzzznotexistzzzz');
            expect(result).toBeNull();
        });
    });

    describe('getCount', () => {
        test('should return a number for a valid folder', () => {
            const count = GenshinService.getCount('characters');
            expect(typeof count).toBe('number');
            expect(count).toBeGreaterThan(0);
        });

        test('should return a number for all folders', () => {
            const count = GenshinService.getCount('all');
            expect(typeof count).toBe('number');
            expect(count).toBeGreaterThan(0);
        });

        test('should return null for an invalid folder', () => {
            const count = GenshinService.getCount('invalidfolder');
            expect(count).toBeNull();
        });
    });

    describe('getFolders', () => {
        test('should return an array of folder names', () => {
            const folders = GenshinService.getFolders();
            expect(Array.isArray(folders)).toBe(true);
            expect(folders.length).toBeGreaterThan(0);
            expect(folders).toContain('characters');
        });
    });

    describe('listNames', () => {
        test('should return an array of names for a valid folder', () => {
            const names = GenshinService.listNames('characters');
            expect(Array.isArray(names)).toBe(true);
            expect(names.length).toBeGreaterThan(0);
        });

        test('should return null for an invalid folder', () => {
            const names = GenshinService.listNames('invalidfolder');
            expect(names).toBeNull();
        });
    });

    describe('getCategoryItems', () => {
        test('should return paginated items for a valid folder', () => {
            const result = GenshinService.getCategoryItems('characters', 1, 5);
            expect(result).not.toBeNull();
            expect(result.folder).toBe('characters');
            expect(result.page).toBe(1);
            expect(result.pageSize).toBe(5);
            expect(typeof result.total).toBe('number');
            expect(result.total).toBeGreaterThan(0);
            expect(typeof result.totalPages).toBe('number');
            expect(result.totalPages).toBeGreaterThan(0);
            expect(Array.isArray(result.items)).toBe(true);
            expect(result.items.length).toBeLessThanOrEqual(5);
        });

        test('should return items with summary fields', () => {
            const result = GenshinService.getCategoryItems('characters', 1, 1);
            expect(result).not.toBeNull();
            expect(result.items.length).toBe(1);
            const item = result.items[0];
            expect(item.name).toBeDefined();
            expect(item.images).toBeDefined();
        });

        test('should return null for an invalid folder', () => {
            const result = GenshinService.getCategoryItems('invalidfolder', 1, 5);
            expect(result).toBeNull();
        });

        test('should clamp page number beyond range', () => {
            const result = GenshinService.getCategoryItems('characters', 99999, 5);
            expect(result).not.toBeNull();
            expect(result.page).toBeLessThanOrEqual(result.totalPages);
            expect(result.page).toBe(result.totalPages);
        });

        test('should calculate correct totalPages', () => {
            const result = GenshinService.getCategoryItems('characters', 1, 24);
            expect(result).not.toBeNull();
            expect(result.totalPages).toBe(Math.ceil(result.total / 24));
        });
    });

    describe('getItemDetail', () => {
        test('should return full data for a valid item', () => {
            const result = GenshinService.getItemDetail('characters', 'amber');
            expect(result).not.toBeNull();
            expect(result.name).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.images).toBeDefined();
        });

        test('should return null for an invalid folder', () => {
            const result = GenshinService.getItemDetail('invalidfolder', 'amber');
            expect(result).toBeNull();
        });

        test('should return null for a non-existent item', () => {
            const result = GenshinService.getItemDetail('characters', 'zzzznotexistzzzz');
            expect(result).toBeNull();
        });

        test('should support resultLanguage parameter', () => {
            const result = GenshinService.getItemDetail('characters', 'amber', 'English');
            expect(result).not.toBeNull();
            expect(result.name).toBe('Amber');
        });
    });

    describe('extractSummary', () => {
        test('should extract name from data', () => {
            const data = GenshinService.getItemDetail('characters', 'amber');
            const summary = GenshinService.extractSummary('characters', data);
            expect(summary.name).toBe(data.name);
        });

        test('should extract rarity when present', () => {
            const data = GenshinService.getItemDetail('characters', 'amber');
            const summary = GenshinService.extractSummary('characters', data);
            expect(summary.rarity).toBe(data.rarity);
        });

        test('should extract images object when present', () => {
            const data = GenshinService.getItemDetail('characters', 'amber');
            const summary = GenshinService.extractSummary('characters', data);
            expect(summary.images).toBeDefined();
            expect(typeof summary.images).toBe('object');
        });

        test('should handle data without images', () => {
            const summary = GenshinService.extractSummary('characters', { name: 'Test' });
            expect(summary.name).toBe('Test');
            expect(summary.images).toBeUndefined();
        });

        test('should extract elementText for characters', () => {
            const data = GenshinService.getItemDetail('characters', 'amber');
            const summary = GenshinService.extractSummary('characters', data);
            expect(summary.elementText).toBeDefined();
        });
    });
});
