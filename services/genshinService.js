const genshindb = require('genshin-db');
const config = require('../config');

class GenshinService {
    // ===== 预建搜索索引（中英双语，启动时一次性构建，之后 O(n) 模糊匹配） =====
    static _searchIndex = null;

    static buildIndex() {
        if (this._searchIndex) return this._searchIndex;

        const index = [];
        for (const folder of config.folders) {
            if (typeof genshindb[folder] !== 'function') continue;
            try {
                // 英文条目（含 id）
                const itemsEn = genshindb[folder]('names', {
                    matchCategories: true,
                    verboseCategories: true,
                    queryLanguages: ['English']
                }) || [];
                // 中文条目
                const itemsZh = genshindb[folder]('names', {
                    matchCategories: true,
                    verboseCategories: true,
                    queryLanguages: ['English'],
                    resultLanguage: 'ChineseSimplified'
                }) || [];

                const zhById = new Map();
                for (const x of itemsZh) {
                    const id = (x && typeof x === 'object') ? (x.id ?? x.name) : x;
                    const name = (x && typeof x === 'object') ? x.name : x;
                    zhById.set(String(id), name);
                }

                for (const x of itemsEn) {
                    const id = (x && typeof x === 'object') ? (x.id ?? x.name) : x;
                    const nameEn = (x && typeof x === 'object') ? x.name : x;
                    if (!nameEn) continue;
                    index.push({
                        id: String(id),
                        nameEn: String(nameEn),
                        nameZh: zhById.get(String(id)) || String(nameEn),
                        folder,
                        label: config.folderLabels[folder] || folder
                    });
                }
            } catch (e) {
                console.warn(`[index] 跳过 ${folder}: ${e.message}`);
            }
        }
        this._searchIndex = index;
        return index;
    }

    /**
     * 模糊搜索：对索引进行相关度打分并排序
     * 打分规则：完全匹配 100 > 前缀匹配 80 > 包含匹配 60
     * @param {string} query 搜索关键词
     * @param {number} limit 最大返回条数
     * @param {string} [folder] 可选，限定分类
     */
    static fuzzySearch(query, limit = 30, folder) {
        const q = String(query || '').trim().toLowerCase();
        if (!q) return { total: 0, results: [] };

        const index = this.buildIndex();
        const pool = folder ? index.filter(i => i.folder === folder) : index;

        const results = [];
        for (const item of pool) {
            const en = (item.nameEn || '').toLowerCase();
            const zh = (item.nameZh || '').toLowerCase();
            let score = 0;
            if (en === q || zh === q) score = 100;
            else if (en.startsWith(q) || zh.startsWith(q)) score = 80;
            else if (en.includes(q) || zh.includes(q)) score = 60;
            if (score > 0) results.push({ ...item, score });
        }

        results.sort((a, b) => b.score - a.score || a.nameEn.localeCompare(b.nameEn));
        const limited = results.slice(0, limit);
        return { total: results.length, results: limited };
    }

    // ===== Enka CDN 图片解析（从 filename_* 字段拼出 CDN URL） =====
    static resolveEnkaImage(images, prefer) {
        if (!images || typeof images !== 'object') return null;
        const order = prefer
            ? [prefer, 'filename_gachaSplash', 'filename_gacha', 'filename_gachasplash',
                'filename_icon', 'filename_awakenicon', 'filename_sideIcon']
            : ['filename_gachaSplash', 'filename_gacha', 'filename_gachasplash',
                'filename_icon', 'filename_awakenicon', 'filename_sideIcon'];
        for (const key of order) {
            if (images[key]) return `${config.enkaCdn}${images[key]}.png`;
        }
        return null;
    }

    // ===== 通用图片解析：优先 Enka CDN，回退到远程 URL =====
    static resolveImage(images, prefer) {
        const enka = this.resolveEnkaImage(images, prefer);
        if (enka) return enka;
        if (!images) return null;
        const remoteKeys = ['mihoyo_icon', 'hoyowiki_icon', 'card', 'icon', 'portrait',
            'cover1', 'cover2', 'image', 'url', 'bannerImg'];
        for (const key of remoteKeys) {
            if (images[key]) return images[key];
        }
        return null;
    }

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
        // 优先 Enka CDN 图片，回退远程 URL
        const imageUrl = this.resolveImage(data.images, 'filename_icon');
        if (imageUrl) summary.imageUrl = imageUrl;
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
