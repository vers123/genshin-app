const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    port: process.env.PORT || 3000,
    resultLanguage: process.env.RESULT_LANGUAGE || 'ChineseSimplified',
    queryLanguages: process.env.QUERY_LANGUAGES
        ? process.env.QUERY_LANGUAGES.split(',')
        : ['ChineseSimplified', 'English', 'Japanese', 'Korean'],

    defaultPage: parseInt(process.env.DEFAULT_PAGE, 10) || 1,
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 24,

    // Enka.Network CDN，用于从 filename_* 字段快速加载图片
    enkaCdn: process.env.ENKA_CDN || 'https://enka.network/ui/',

    // 分类中文标签映射（供搜索结果展示与百科分类共用）
    folderLabels: {
        characters: '角色', talents: '天赋', constellations: '命之座', outfits: '衣装',
        weapons: '武器', artifacts: '圣遗物', materials: '材料',
        foods: '食物', domains: '秘境', enemies: '敌人', animals: '动物', geographies: '地理志',
        achievements: '成就', achievementgroups: '成就组', namecards: '名片', windgliders: '风之翼',
        adventureranks: '冒险等阶', elements: '元素', crafts: '锻造', rarity: '稀有度',
        talentmaterialtypes: '天赋材料类型',
        tcgcharactercards: '角色卡', tcgactioncards: '行动卡', tcgcardbacks: '卡背',
        tcgcardboxes: '卡盒', tcgkeywords: '关键词', tcgsummons: '召唤物',
        tcgstatuseffects: '状态效果', tcgdetailedrules: '详细规则', tcglevelrewards: '等级奖励'
    },

    folders: [
        'characters', 'talents', 'constellations', 'outfits',
        'weapons', 'artifacts', 'materials',
        'foods', 'domains', 'enemies', 'animals', 'geographies',
        'achievements', 'achievementgroups', 'namecards', 'windgliders',
        'adventureranks', 'elements', 'crafts', 'rarity',
        'talentmaterialtypes',
        'tcgcharactercards', 'tcgactioncards', 'tcgcardbacks',
        'tcgcardboxes', 'tcgkeywords', 'tcgsummons',
        'tcgstatuseffects', 'tcgdetailedrules', 'tcglevelrewards'
    ]
};
