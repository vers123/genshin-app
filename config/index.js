const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    port: process.env.PORT || 3000,
    resultLanguage: process.env.RESULT_LANGUAGE || 'ChineseSimplified',
    queryLanguages: process.env.QUERY_LANGUAGES
        ? process.env.QUERY_LANGUAGES.split(',')
        : ['ChineseSimplified', 'English', 'Japanese', 'Korean'],

    folders: [
        'characters', 'talents', 'constellations', 'outfits',
        'weapons', 'artifacts', 'materials',
        'foods', 'domains', 'enemies', 'animals', 'geographies',
        'achievements', 'achievementgroups', 'namecards', 'windgliders',
        'adventureranks', 'elements', 'crafts', 'rarity'
    ]
};