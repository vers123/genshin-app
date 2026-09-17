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

    static getCategoryItems(folder, page = 1, pageSize = 24, resultLanguage) {
        if (typeof genshindb[folder] !== 'function') return null;
        const names = genshindb[folder]('names', {
            matchCategories: true,
            queryLanguages: ['English']
        });
        if (!Array.isArray(names)) return null;

        const total = names.length;
        const totalPages = Math.ceil(total / pageSize);
        const pageNum = Math.max(1, Math.min(page, totalPages));
        const start = (pageNum - 1) * pageSize;
        const pageNames = names.slice(start, start + pageSize);

        const items = pageNames.map(name => {
            const data = genshindb[folder](name, {
                queryLanguages: ['English'],
                resultLanguage: resultLanguage || config.resultLanguage
            });
            if (!data) return null;
            return this.extractSummary(folder, data);
        }).filter(Boolean);

        return { folder, page: pageNum, pageSize, total, totalPages, items };
    }

    static getItemDetail(folder, query, resultLanguage) {
        if (typeof genshindb[folder] !== 'function') return null;
        const data = genshindb[folder](query, {
            queryLanguages: config.queryLanguages,
            resultLanguage: resultLanguage || config.resultLanguage,
            matchNames: true,
            matchAltNames: true,
            matchAliases: true,
            matchCategories: false,
            verboseCategories: false
        });
        return data || null;
    }

    static extractSummary(folder, data) {
        const summary = { name: data.name || '' };
        if (data.rarity) summary.rarity = data.rarity;
        if (data.id) summary.id = data.id;
        if (data.elementText) summary.elementText = data.elementText;
        if (data.elementType) summary.elementType = data.elementType;
        if (data.weaponText) summary.weaponText = data.weaponText;
        if (data.weaponType) summary.weaponType = data.weaponType;
        if (data.region) summary.region = data.region;
        if (data.associationType) summary.associationType = data.associationType;
        if (data.type) summary.type = data.type;
        if (data.category) summary.category = data.category;
        if (data.description) summary.description = data.description;
        if (data.subtitle) summary.subtitle = data.subtitle;
        if (data.dropArea) summary.dropArea = data.dropArea;
        if (data.setEffect) summary.hasSetEffect = true;

        if (data.images) {
            summary.images = {};
            if (data.images.icon) summary.images.icon = data.images.icon;
            if (data.images.card) summary.images.card = data.images.card;
            if (data.images.portrait) summary.images.portrait = data.images.portrait;
            if (data.images.cover1) summary.images.cover = data.images.cover1;
            else if (data.images.cover2) summary.images.cover = data.images.cover2;
            if (data.images.hoyowiki_icon) summary.images.hoyowiki_icon = data.images.hoyowiki_icon;
            if (data.images.mihoyo_icon) summary.images.mihoyo_icon = data.images.mihoyo_icon;
            if (data.images.sideIcon) summary.images.sideIcon = data.images.sideIcon;
            if (data.images.url) summary.images.url = data.images.url;
            if (data.images.image) summary.images.image = data.images.image;
            if (data.images.bannerImg) summary.images.bannerImg = data.images.bannerImg;
            if (data.images.filename) summary.images.filename = data.images.filename;
            if (data.images.filename_icon) summary.images.filename_icon = data.images.filename_icon;
            if (data.images.filename_sideIcon) summary.images.filename_sideIcon = data.images.filename_sideIcon;
            if (data.images.filename_gachaSplash) summary.images.filename_gachaSplash = data.images.filename_gachaSplash;
        }

        if (data.url) summary.url = data.url;
        if (data.version) summary.version = data.version;

        return summary;
    }
}

module.exports = GenshinService;
