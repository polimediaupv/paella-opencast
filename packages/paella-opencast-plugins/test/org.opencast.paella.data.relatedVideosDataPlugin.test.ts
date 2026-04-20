import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { runPluginOnlyInOpencastTests, runDataPluginTests } from './utils/buttonPluginTests';
import { createMockOCPlayer } from './__mocks__/mockPlayer';
import RelatedVideosDataPlugin from '../src/plugins/org.opencast.paella.data.relatedVideosDataPlugin';


describe('RelatedVideosDataPlugin', () => {
    let plugin: RelatedVideosDataPlugin;
    let mockOcPlayer: any;

    const setConfig = (config: any) => {
        Object.defineProperty(plugin as any, 'config', {
            configurable: true,
            get: () => config
        });
    };

    beforeEach(() => {
        mockOcPlayer = createMockOCPlayer();
        plugin = new RelatedVideosDataPlugin(mockOcPlayer);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    runPluginOnlyInOpencastTests(() => plugin, () => mockOcPlayer);

    describe('shoud pass DataPlugin Tests', () => {
        runDataPluginTests(() => plugin, () => mockOcPlayer);
    });

    test('should have correct plugin name', () => {
        expect(plugin.name).toBe('org.opencast.paella.data.relatedVideosDataPlugin');
    });

    describe('read', () => {
        test('should return noneEvents when current event has no series', async () => {
            mockOcPlayer.getEvent.mockReturnValue({
                id: 'event-1',
                metadata: {
                    series: null
                }
            });

            const getEventsSpy = vi.spyOn(plugin, 'getCommonEventsFromSearchAPI');
            const result = await plugin.read('relatedVideos', 'ignored');

            expect(getEventsSpy).not.toHaveBeenCalled();
            expect(result).toEqual({
                total: 0,
                skip: 0,
                limit: 0,
                items: []
            });
        });

        test('should map related events to plugin response items', async () => {
            setConfig({ maxCount: 2 });

            mockOcPlayer.getEvent.mockReturnValue({
                id: 'event-1',
                metadata: {
                    series: 'series-1'
                }
            });

            vi.spyOn(plugin, 'getCommonEventsFromSearchAPI').mockResolvedValue([
                {
                    id: 'rel-1',
                    metadata: {
                        title: 'Related 1',
                        presenters: ['A', 'B'],
                        duration: 120
                    },
                    attachments: [
                        { id: 'a1', url: 'http://example.com/preview-1.jpg', flavor: 'presenter/player+preview', mimetype: 'image/jpeg', tags: [] }
                    ]
                },
                {
                    id: 'rel-2',
                    metadata: {
                        title: 'Related 2',
                        presenters: ['C'],
                        duration: 90
                    },
                    attachments: []
                }
            ] as any);

            const result = await plugin.read('relatedVideos', 'ignored');

            expect(result.total).toBe(2);
            expect(result.limit).toBe(2);
            expect(result.items).toHaveLength(2);
            expect(result.items[0]).toMatchObject({
                id: 'rel-1',
                title: 'Related 1',
                presenter: 'A, B',
                previewUrl: 'http://example.com/preview-1.jpg',
                url: '?id=rel-1'
            });
            expect(result.items[1]).toMatchObject({
                id: 'rel-2',
                title: 'Related 2',
                presenter: 'C',
                previewUrl: '',
                url: '?id=rel-2'
            });
        });

        test('should call getCommonEventsFromSearchAPI with configured maxCount as limit', async () => {
            setConfig({ maxCount: 7 });

            mockOcPlayer.getEvent.mockReturnValue({
                id: 'event-1',
                metadata: {
                    series: 'series-limit'
                }
            });

            const getEventsSpy = vi.spyOn(plugin, 'getCommonEventsFromSearchAPI').mockResolvedValue([] as any);

            const result = await plugin.read('relatedVideos', 'ignored');

            expect(getEventsSpy).toHaveBeenCalledWith({
                series: 'series-limit',
                limit: 7
            });
            expect(result).toEqual({
                total: 0,
                skip: 0,
                limit: 7,
                items: []
            });
        });

        test('should return noneEvents when getCommonEventsFromSearchAPI throws', async () => {
            setConfig({ maxCount: 5 });

            mockOcPlayer.getEvent.mockReturnValue({
                id: 'event-1',
                metadata: {
                    series: 'series-1'
                }
            });

            vi.spyOn(plugin, 'getCommonEventsFromSearchAPI').mockRejectedValue(new Error('fetch failed'));

            const result = await plugin.read('relatedVideos', 'ignored');

            expect(result).toEqual({
                total: 0,
                skip: 0,
                limit: 0,
                items: []
            });
        });

        test('should return noneEvents when internal read flow throws', async () => {
            mockOcPlayer.getEvent.mockImplementation(() => {
                throw new Error('boom');
            });

            const result = await plugin.read('relatedVideos', 'ignored');
            expect(result).toEqual({
                total: 0,
                skip: 0,
                limit: 0,
                items: []
            });
        });
    });

    describe('getCommonEventsFromSearchAPI', () => {
        test('should return [] and log warn when opencast URL is null', async () => {
            mockOcPlayer.getUrlFromOpencastServer.mockReturnValue(null);

            const events = await plugin.getCommonEventsFromSearchAPI({ series: 's1', limit: 3 });

            expect(events).toEqual([]);
            expect(mockOcPlayer.log.warn).toHaveBeenCalledWith(
                'Opencast server URL not set',
                expect.stringContaining('[org.opencast.paella.data.relatedVideosDataPlugin]')
            );
        });

        test('should parse legacy search-results format', async () => {
            mockOcPlayer.getUrlFromOpencastServer.mockReturnValue('http://example.com/search');
            vi.stubGlobal('fetch', vi.fn(() =>
                Promise.resolve({
                    json: () => Promise.resolve({
                        'search-results': {
                            total: 1,
                            result: {
                                mediapackage: {
                                    id: 'legacy-1',
                                    title: 'Legacy Event',
                                    media: { track: [] },
                                    attachments: { attachment: [] },
                                    metadata: { catalog: [] }
                                }
                            }
                        }
                    })
                })
            ));

            const events = await plugin.getCommonEventsFromSearchAPI({ series: 's1', limit: 3 });

            expect(events).toHaveLength(1);
            expect(events[0].id).toBe('legacy-1');
            expect(events[0].metadata?.title).toBe('Legacy Event');
        });

        test('should parse new result format (OC >= 16)', async () => {
            mockOcPlayer.getUrlFromOpencastServer.mockReturnValue('http://example.com/search');
            vi.stubGlobal('fetch', vi.fn(() =>
                Promise.resolve({
                    json: () => Promise.resolve({
                        total: 1,
                        result: [
                            {
                                mediapackage: {
                                    id: 'new-1',
                                    title: 'New Event',
                                    media: { track: [] },
                                    attachments: { attachment: [] },
                                    metadata: { catalog: [] }
                                }
                            }
                        ]
                    })
                })
            ));

            const events = await plugin.getCommonEventsFromSearchAPI({ series: 's1', limit: 3 });

            expect(events).toHaveLength(1);
            expect(events[0].id).toBe('new-1');
            expect(events[0].metadata?.title).toBe('New Event');
        });

        test('should return [] when total is 0 in new format', async () => {
            mockOcPlayer.getUrlFromOpencastServer.mockReturnValue('http://example.com/search');
            vi.stubGlobal('fetch', vi.fn(() =>
                Promise.resolve({
                    json: () => Promise.resolve({
                        total: 0,
                        result: []
                    })
                })
            ));

            const events = await plugin.getCommonEventsFromSearchAPI({ series: 's1', limit: 3 });
            expect(events).toEqual([]);
        });

        test('should return [] and log error on unrecognized format', async () => {
            mockOcPlayer.getUrlFromOpencastServer.mockReturnValue('http://example.com/search');
            vi.stubGlobal('fetch', vi.fn(() =>
                Promise.resolve({
                    json: () => Promise.resolve({
                        foo: 'bar'
                    })
                })
            ));

            const events = await plugin.getCommonEventsFromSearchAPI({ series: 's1', limit: 3 });

            expect(events).toEqual([]);
            expect(mockOcPlayer.log.error).toHaveBeenCalledWith(
                'Opencast format not recognized. Cannot convert!',
                expect.stringContaining('[org.opencast.paella.data.relatedVideosDataPlugin]')
            );
        });
    });

    describe('getPreview', () => {
        test('should return presenter/player+preview attachment URL by default', () => {
            const preview = plugin.getPreview({
                id: 'ev-1',
                attachments: [
                    { id: 'a1', flavor: 'presenter/player+preview', url: 'http://example.com/presenter.jpg', mimetype: 'image/jpeg', tags: [] }
                ]
            } as any);

            expect(preview).toBe('http://example.com/presenter.jpg');
        });

        test('should return empty string when no matching preview attachment exists', () => {
            const preview = plugin.getPreview({
                id: 'ev-1',
                attachments: [
                    { id: 'a1', flavor: 'security/xacml+episode', url: 'http://example.com/no-preview.xml', mimetype: 'text/xml', tags: [] }
                ]
            } as any);

            expect(preview).toBe('');
        });

        test('should use custom playerPreviewAttachmentsFlavours from config', () => {
            setConfig({ playerPreviewAttachmentsFlavours: ['custom/preview'] });

            const preview = plugin.getPreview({
                id: 'ev-1',
                attachments: [
                    { id: 'a1', flavor: 'custom/preview', url: 'http://example.com/custom.jpg', mimetype: 'image/jpeg', tags: [] }
                ]
            } as any);

            expect(preview).toBe('http://example.com/custom.jpg');
        });
    });

});