import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    prettier,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        ignores: [
            '**/dist/**',
            '**/node_modules/**',
            '**/.turbo/**',
            '**/doc/**',
            '**/coverage/**',
            '**/playwright-report/**',
            '**/test-results/**',
            '**/*.js',
            '**/*.d.ts',
            '**/vite-env.d.ts',
        ],
    },
    // Relaxed rules for packages with extensive dynamic API data handling
    {
        files: [
            'packages/paella-opencast-core/src/**/*.ts',
            'packages/paella-opencast-plugins/src/**/*.ts',
            'packages/opencast-engage-paella-player/src/**/*.ts',
        ],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/related-getter-setter-pairs': 'off',
            'no-prototype-builtins': 'off',
        },
    },
);
