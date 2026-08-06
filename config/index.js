const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    port: process.env.PORT || 3000,
    resultLanguage: process.env.RESULT_LANGUAGE || 'ChineseSimplified',
    queryLanguages: process.env.QUERY_LANGUAGES
        ? process.env.QUERY_LANGUAGES.split(',')
        : ['ChineseSimplified', 'English', 'Japanese', 'Korean'],
    // 所有可搜索的分类（从 genshin-db 支持的方法中抽取，也可动态获取）
    folders: [
        'characters', 'talents', 'constellations', 'outfits',
        'weapons', 'artifacts', 'materials',
        'foods', 'domains', 'enemies', 'animals', 'geographies',
        'achievements', 'achievementgroups', 'namecards', 'windgliders',
        'adventureranks', 'elements', 'crafts', 'rarity'
    ]
};