import { describe, expect, test } from 'vitest';
import { theme } from '../src/skins/opencast/theme';

describe('opencast skin theme', () => {
    test('exports a defined theme object', () => {
        expect(theme).toBeDefined();
        expect(theme).not.toBeNull();
    });

    test('contains at least one stylesheet', () => {
        expect(Array.isArray(theme.styleSheets)).toBe(true);
        expect(theme.styleSheets.length).toBeGreaterThan(0);
    });

    test('contains icon mappings with required fields', () => {
        expect(Array.isArray(theme.icons)).toBe(true);
        expect(theme.icons.length).toBeGreaterThanOrEqual(20);

        for (const iconDef of theme.icons) {
            expect(iconDef.plugin).toBeTypeOf('string');
            expect(iconDef.plugin.length).toBeGreaterThan(0);

            expect(iconDef.identifier).toBeTypeOf('string');
            expect(iconDef.identifier.length).toBeGreaterThan(0);

            expect(iconDef.icon).toBeTypeOf('string');
            expect(iconDef.icon.length).toBeGreaterThan(0);
            expect(iconDef.icon).not.toBeNull();
            expect(iconDef.icon).not.toBeUndefined();
        }
    });

    test('contains button group overrides', () => {
        expect(theme.configOverrides).toBeDefined();
        expect(Array.isArray(theme.configOverrides?.buttonGroups)).toBe(true);
        expect(theme.configOverrides?.buttonGroups.length).toBeGreaterThanOrEqual(1);
    });

    test('matches theme snapshot', () => {
        expect(theme).toMatchSnapshot();
    });
});
