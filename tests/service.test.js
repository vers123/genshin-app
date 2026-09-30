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

        test('should include imageUrl resolved from Enka CDN or remote', () => {
            const data = GenshinService.getItemDetail('characters', 'amber');
            const summary = GenshinService.extractSummary('characters', data);
            // 角色通常有图片，imageUrl 应为字符串
            expect(typeof summary.imageUrl).toBe('string');
        });
    });

    describe('buildIndex', () => {
        test('should return an array with entries', () => {
            const index = GenshinService.buildIndex();
            expect(Array.isArray(index)).toBe(true);
            expect(index.length).toBeGreaterThan(1000);
        });

        test('each entry should have id, nameEn, nameZh, folder, label', () => {
            const index = GenshinService.buildIndex();
            const item = index[0];
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('nameEn');
            expect(item).toHaveProperty('nameZh');
            expect(item).toHaveProperty('folder');
            expect(item).toHaveProperty('label');
        });

        test('should include characters folder entries', () => {
            const index = GenshinService.buildIndex();
            const chars = index.filter(i => i.folder === 'characters');
            expect(chars.length).toBeGreaterThan(0);
        });

        test('should be cached (second call returns same reference)', () => {
            const a = GenshinService.buildIndex();
            const b = GenshinService.buildIndex();
            expect(a).toBe(b);
        });
    });

    describe('fuzzySearch', () => {
        test('should return empty for empty query', () => {
            const result = GenshinService.fuzzySearch('');
            expect(result.total).toBe(0);
            expect(result.results).toEqual([]);
        });

        test('should find Zhongli by Chinese prefix', () => {
            const result = GenshinService.fuzzySearch('钟', 10);
            expect(result.total).toBeGreaterThan(0);
            const zhongli = result.results.find(r => r.nameZh === '钟离' && r.folder === 'characters');
            expect(zhongli).toBeDefined();
        });

        test('should find Staff of Homa by English substring', () => {
            const result = GenshinService.fuzzySearch('homa', 10);
            const homa = result.results.find(r => r.folder === 'weapons');
            expect(homa).toBeDefined();
        });

        test('exact match should score 100', () => {
            const result = GenshinService.fuzzySearch('amber', 10);
            const exact = result.results.find(r => r.nameEn.toLowerCase() === 'amber' && r.folder === 'characters');
            expect(exact).toBeDefined();
            expect(exact.score).toBe(100);
        });

        test('should respect folder filter', () => {
            const result = GenshinService.fuzzySearch('amber', 10, 'weapons');
            expect(result.results.every(r => r.folder === 'weapons')).toBe(true);
        });

        test('should limit results', () => {
            const result = GenshinService.fuzzySearch('a', 5);
            expect(result.results.length).toBeLessThanOrEqual(5);
        });

        test('results should be sorted by score descending', () => {
            const result = GenshinService.fuzzySearch('amber', 20);
            for (let i = 1; i < result.results.length; i++) {
                expect(result.results[i - 1].score).toBeGreaterThanOrEqual(result.results[i].score);
            }
        });
    });

    describe('resolveEnkaImage', () => {
        test('should return Enka CDN URL for filename_icon', () => {
            const url = GenshinService.resolveEnkaImage({ filename_icon: 'UI_AvatarIcon_Ambor' });
            expect(url).toBe('https://enka.network/ui/UI_AvatarIcon_Ambor.png');
        });

        test('should return null when no filename fields', () => {
            const url = GenshinService.resolveEnkaImage({ icon: 'http://example.com/x.png' });
            expect(url).toBeNull();
        });

        test('should return null for null images', () => {
            expect(GenshinService.resolveEnkaImage(null)).toBeNull();
        });
    });

    describe('resolveImage', () => {
        test('should prefer Enka CDN over remote URL', () => {
            const url = GenshinService.resolveImage({
                filename_icon: 'UI_AvatarIcon_Ambor',
                mihoyo_icon: 'http://example.com/x.png'
            });
            expect(url).toBe('https://enka.network/ui/UI_AvatarIcon_Ambor.png');
        });

        test('should fall back to remote URL when no filename', () => {
            const url = GenshinService.resolveImage({ mihoyo_icon: 'http://example.com/x.png' });
            expect(url).toBe('http://example.com/x.png');
        });
    });

    describe('getChangelog', () => {
        test('should return an array', () => {
            const changelog = GenshinService.getChangelog();
            expect(Array.isArray(changelog)).toBe(true);
        });

        test('should include v1.1.0 release notes', () => {
            const changelog = GenshinService.getChangelog();
            const release = changelog.find(r => r.version === '1.1.0');
            expect(release).toBeDefined();
            expect(release.tag).toBe('v1.1.0');
            expect(release.content).toContain('搜索');
        });

        test('entries should have required fields', () => {
            const changelog = GenshinService.getChangelog();
            if (changelog.length > 0) {
                const r = changelog[0];
                expect(r).toHaveProperty('version');
                expect(r).toHaveProperty('tag');
                expect(r).toHaveProperty('content');
                expect(r).toHaveProperty('date');
                expect(r).toHaveProperty('filename');
            }
        });

        test('should be sorted by version descending', () => {
            const changelog = GenshinService.getChangelog();
            for (let i = 1; i < changelog.length; i++) {
                const prev = changelog[i - 1].version.split('.').map(Number);
                const curr = changelog[i].version.split('.').map(Number);
                const cmp = prev[0] - curr[0] || prev[1] - curr[1] || prev[2] - curr[2];
                expect(cmp).toBeGreaterThanOrEqual(0);
            }
        });
    });
});
