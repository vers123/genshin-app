const genshindb = require('genshin-db');
const config = require('../config');

class GenshinService {
    static search(folder, query, resultLanguage) {
        if (typeof genshindb[folder] !== 'function') return null;
        const options = {
            queryLanguages: config.queryLanguages,
            resultLanguage: resultLanguage || config.resultLanguage,
            matchNames: true,
            matchAltNames: true,
            matchAliases: true,
            matchCategories: false,
            verboseCategories: false
        };
        return genshindb[folder](query, options);
    }

    static searchAll(query, resultLanguage) {
        const results = {};
        let hasResult = false;
        for (const folder of config.folders) {
            const data = this.search(folder, query, resultLanguage);
            if (data) {
                results[folder] = data;
                hasResult = true;
            }
        }
        return hasResult ? { type: 'aggregated', total: Object.keys(results).length, results } : null;
    }

    static getCount(folder) {
        if (folder === 'all') {
            let total = 0;
            for (const f of config.folders) {
                const names = genshindb[f]('names', { matchCategories: true, queryLanguages: ['English'] });
                if (Array.isArray(names)) total += names.length;
            }
            return total;
        }
        if (typeof genshindb[folder] !== 'function') return null;
        const names = genshindb[folder]('names', { matchCategories: true, queryLanguages: ['English'] });
        return Array.isArray(names) ? names.length : 0;
    }

    static getFolders() {
        return config.folders.filter(folder => typeof genshindb[folder] === 'function');
    }

    static listNames(folder, resultLanguage) {
        if (typeof genshindb[folder] !== 'function') return null;
        const options = {
            matchCategories: true,
            queryLanguages: ['English'],
            resultLanguage: resultLanguage || config.resultLanguage
        };
        const names = genshindb[folder]('names', options);
        return Array.isArray(names) ? names : [];
    }
}

module.exports = GenshinService;
