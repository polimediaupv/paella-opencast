import { OpencastPaellaPlayer } from "@asicupv/paella-opencast-core";
import { Paella } from '@asicupv/paella-core';
import { vi } from "vitest";

export const createMockPlayer = () => {
    const mockPlayer = {
        log: {
            debug: vi.fn(),
            log: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        },
        getCustomPluginIcon: vi.fn(),
        translate: vi.fn((key: string) => key),
        captionsCanvas: {
            captions: vi.fn(() => []),
            disableCaptions: vi.fn(() => Promise.resolve()),
            enableCaptions: vi.fn(() => Promise.resolve()),            
        },
        config: vi.fn(() => Promise.resolve({})),
        paused: vi.fn(() => Promise.resolve(false)),
        play: vi.fn(() => Promise.resolve()),
        pause: vi.fn(() => Promise.resolve()),
        volume: vi.fn(() => Promise.resolve(0.5)),
        setVolume: vi.fn(() => Promise.resolve()),
        currentTime: vi.fn(() => Promise.resolve(10)),
        duration: vi.fn(() => Promise.resolve(100)),
        setCurrentTime: vi.fn(() => Promise.resolve()),
        isFullscreen: vi.fn(() => false),
        enterFullscreen: vi.fn(() => Promise.resolve()),
        exitFullscreen: vi.fn(() => Promise.resolve()),
        getEvent: vi.fn(),
        getUrlFromOpencastServer: vi.fn(),
        playbackRate: vi.fn(() => Promise.resolve(1)),
        setPlaybackRate: vi.fn(() => Promise.resolve()),
        

        videoId: 'test-video-id'
        // videoManifest: {
        //     metadata: {}
        // },
    };
    Object.setPrototypeOf(mockPlayer, Paella.prototype);

    return mockPlayer;
};


export const createMockOCPlayer = () => {
    const mockPlayer = createMockPlayer();

        // Mock del opencast auth
    const mockOpencastAuth = {
      isAnonymous: vi.fn(),
      canWrite: vi.fn(),
      auth: vi.fn()
    };

    const mockOcPlayer = {
        ...mockPlayer,
        opencastAuth: mockOpencastAuth,
        detailedVersion: {
            player: '2.0.0',
            coreLibrary: '2.0.0',
            pluginModules: ['paella-opencast-plugins: 1.0.0'],
        },
    };

    Object.setPrototypeOf(mockOcPlayer, OpencastPaellaPlayer.prototype);

    return mockOcPlayer;
};
