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
});
