/* eslint-disable */
module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        'plugin:react/recommended',
        'standard-with-typescript'
    ],
    overrides: [
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json']
    },
    plugins: [
        'react'
    ],
    rules: {
        indent: 'off',
        '@typescript-eslint/indent': ['error', 4],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/quotes': ['error', 'double'],
        '@typescript-eslint/semi': ['error', 'always'],
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/no-floating-promises': ['warn'],
        '@typescript-eslint/strict-boolean-expressions' : ['warn'],
        '@typescript-eslint/prefer-ts-expect-error': 'off',
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/restrict-template-expressions": "warn",
    }
}
