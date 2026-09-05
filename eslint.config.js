module.exports = {
    env: {
        node: true,
        commonjs: true,
        es2021: true,
        jest: true,
        browser: true
    },
    parserOptions: {
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
    ignorePatterns: ['node_modules/', 'coverage/', 'build/']
};
