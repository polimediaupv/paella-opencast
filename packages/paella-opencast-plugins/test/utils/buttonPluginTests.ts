import { describe, expect, test, vi } from 'vitest';
import { Paella, Plugin, ButtonPlugin, UserInterfacePlugin, PopUpButtonPlugin, DataPlugin } from '@asicupv/paella-core';



export function runPluginOnlyInOpencastTests(getPlugin: () => Plugin, getMockPlayer: () => Paella) {

    test('should return false and log warning for non-Opencast player', async () => {
        const plugin = getPlugin();
        const mockPlayer = getMockPlayer();
        // Pretend that it is not an instance of OpencastPaellaPlayer
        Object.setPrototypeOf(mockPlayer, Object.prototype);
        
        const result = await plugin.isEnabled();
        expect(result).toBe(false);
        expect(mockPlayer.log.warn).toHaveBeenCalled();
    });
}

export function runPluginTests(getPlugin: () => Plugin, getMockPlayer: () => Paella) {

    test('should get plugin module instance', () => {
        const plugin = getPlugin();
        const moduleInstance = plugin.getPluginModuleInstance();
        expect(moduleInstance).toBeDefined();
    });

    test('should have a plugin name', () => {
        const plugin = getPlugin();
        expect(plugin.name).toBeDefined();
    });

    describe('PluginTests.isEnabled()', () => {

        test('should call super.isEnabled', async () => {
            const plugin = getPlugin();
            
            vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled');
            
            await plugin.isEnabled();            
            expect(Object.getPrototypeOf(Object.getPrototypeOf(plugin)).isEnabled).toHaveBeenCalled();
        });

        test('should return false when super.isEnabled returns false', async () => {
            const plugin = getPlugin();

            vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(plugin)), 'isEnabled')
                .mockResolvedValue(false);
            
            const result = await plugin.isEnabled();
            expect(result).toBe(false);
        });
    });

}

export function runDataPluginTests(getPlugin: () => DataPlugin, getMockPlayer: () => Paella) {
    describe('should pass Plugin Tests', () => {
        runPluginTests(getPlugin, getMockPlayer);
    });
};


export function runUserInterfacePluginTests(getPlugin: () => UserInterfacePlugin, getMockPlayer: () => Paella) {

    describe('should pass Plugin Tests', () => {
        runPluginTests(getPlugin, getMockPlayer);
    });

};


export function runButtonPluginTests(getPlugin: () => ButtonPlugin, getMockPlayer: () => any) {

    describe('should pass UserInterfacePlugin Tests', () => {
        runUserInterfacePluginTests(getPlugin, getMockPlayer);
    });

    test('should get help information', async () => {
        const plugin = getPlugin();
        const help = await plugin.getHelp();
        expect(help).toBeDefined();
        expect(help?.title).toBeDefined();
        expect(help?.description).toBeDefined();    
    });
    

    test('should get aria-label', () => {
        const plugin = getPlugin();
        const mockPlayer = getMockPlayer();
        const ariaLabel = plugin.getAriaLabel();
        expect(ariaLabel).toBeDefined();
        expect(mockPlayer.translate).toHaveBeenCalled();
    });

    test('should get description', () => {
        const plugin = getPlugin();
        const mockPlayer = getMockPlayer();
        const description = plugin.getDescription();
        expect(description).toBeDefined;
        expect(mockPlayer.translate).toHaveBeenCalled();
    });


    describe('load', () => {
        test('[ButtonPluginTests:load] should load custom buttonIcon', async () => {
            const plugin = getPlugin();
            const mockPlayer = getMockPlayer();

            const customIcon = '<svg>custom-icon</svg>';
            mockPlayer.getCustomPluginIcon.mockReturnValue(customIcon);

            await plugin.load();
            expect(mockPlayer.getCustomPluginIcon).toHaveBeenCalledWith(plugin.name, 'buttonIcon');
            expect(plugin.icon).toBe(customIcon);
        });

        test('[ButtonPluginTests:load] should load default icon when no custom buttonIcon', async () => {
            const plugin = getPlugin();
            const mockPlayer = getMockPlayer();

            mockPlayer.getCustomPluginIcon.mockReturnValue(null);

            await plugin.load();
            expect(plugin.icon).toBeDefined();
        });
    });

};


export function runPopUpButtonPluginTests(getPlugin: () => PopUpButtonPlugin, getMockPlayer: () => Paella) {
    
    describe('should pass ButtonPlugin Tests', () => {
        runButtonPluginTests(getPlugin, getMockPlayer);
    });

    test('should get content', async () => {
        const plugin = getPlugin();

        const content = await plugin.getContent();
        expect(content).toBeDefined();
        expect(content instanceof HTMLElement).toBe(true);
    });
}
