// @ts-check

import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
                // Testing globals (Vitest)
                vi: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                // Node.js specific
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                globalThis: 'writable'
            }
        },
        rules: {
            // Indentation and formatting
            'indent': ['error', 4, { SwitchCase: 1 }],
      
            // Restrict problematic syntax patterns
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'ForInStatement',
                    message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.'
                },
                {
                    selector: 'LabeledStatement',
                    message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.'
                },
                {
                    selector: 'WithStatement',
                    message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.'
                }
            ],

            // Import/export preferences for ES modules
            'import/prefer-default-export': 'off',
            'import/no-extraneous-dependencies': 'off',
            'import/extensions': 'off',

            // Promise and async handling (important for MCP and GraphQL)
            'no-async-promise-executor': 'off',
            'prefer-promise-reject-errors': 'error',
            'no-return-await': 'error',

            // Code style and formatting
            'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
            'comma-dangle': ['error', 'never'],
            'no-param-reassign': ['error', { props: false }],
            'max-len': ['warn', { code: 120, ignoreComments: true, ignoreUrls: true }],
            'linebreak-style': 'off',
            'no-plusplus': 'off',
            'no-console': 'off', // Allow for server logging
            'no-debugger': 'warn', // Warn but allow for development
            'no-cond-assign': ['error', 'except-parens'],
            'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
            'no-underscore-dangle': ['error', { 
                allow: ['_id', '__dirname', '__filename', '_error', '_result'] 
            }],

            // Error handling and safety
            'no-unused-vars': 'off', // Let TypeScript handle this
            'prefer-const': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-arrow-callback': 'error',

            // API and database best practices
            'no-throw-literal': 'error',
            'no-await-in-loop': 'warn',

            // TypeScript specific overrides
            '@typescript-eslint/no-unused-vars': ['warn', { 
                args: 'none', // Don't check unused function arguments
                vars: 'local', // Only check local variables, ignore globals
                ignoreRestSiblings: true // Ignore unused variables when destructuring
            }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'warn'
        }
    },
    {
    // Specific config for test files (Vitest)
        files: ['**/*.spec.js', '**/*.test.js', '**/__tests__/**/*', '**/setup/**/*'],
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'max-len': 'off'
        }
    },
    {
    // Specific config for configuration files
        files: ['*.config.js', '*.config.mjs', 'eslint.config.js'],
        rules: {
            'import/no-extraneous-dependencies': 'off'
        }
    },
    {
    // Specific config for GraphQL and schema files
        files: ['**/graphql/**/*.js', '**/schemas/**/*.js'],
        rules: {
            'max-len': ['warn', { code: 150 }], // GraphQL queries can be longer
            'object-curly-newline': 'off'
        }
    },
    {
    // Specific config for MCP handler and tool files
        files: ['**/mcp/**/*.js', '**/tools/**/*.js'],
        rules: {
            'no-console': 'off', // Allow logging in MCP tools
            'complexity': ['warn', 10] // Keep MCP handlers simple
        }
    }
);
