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
