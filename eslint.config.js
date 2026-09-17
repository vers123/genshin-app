const globals = require('globals');

module.exports = [
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.commonjs,
                ...globals.browser,
                ...globals.jest
            },
            ecmaVersion: 2021,
            sourceType: 'script'
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
            'semi': ['error', 'always'],
            'quotes': ['error', 'single'],
            'indent': ['error', 4],
            'no-trailing-spaces': 'error',
            'no-multiple-empty-lines': ['error', { max: 2 }],
            'comma-dangle': ['error', 'never']
        },
        ignores: ['node_modules/', 'coverage/', 'build/']
    }
];
