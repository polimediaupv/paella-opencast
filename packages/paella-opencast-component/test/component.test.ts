import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const mockState = vi.hoisted(() => ({
  superGetLoggedUserNameSpy: vi.fn(async () => 'fallback-user'),
  superCanWriteSpy: vi.fn(async () => false),
  playerConstructorSpy: vi.fn(),
  nextConstructorError: null as Error | null,
  blockFirstLoadManifest: false,
  firstLoadManifestResolver: null as (() => void) | null,
  playerInstances: [] as any[]
}));

const {
  superGetLoggedUserNameSpy,
  superCanWriteSpy,
  playerConstructorSpy,
  playerInstances
} = mockState;

vi.mock('@asicupv/paella-opencast-core', () => ({
  OpencastAuthDefaultImpl: class {
    player: unknown = null;

    async getLoggedUserName() {
      return mockState.superGetLoggedUserNameSpy();
    }

    async canWrite() {
      return mockState.superCanWriteSpy();
    }
  },
  OpencastPaellaPlayer: class {
    readonly applyOpencastTheme: ReturnType<typeof vi.fn>;
    readonly loadManifest: ReturnType<typeof vi.fn>;

    constructor(public elem: HTMLElement, public initParams: any) {
      if (mockState.nextConstructorError) {
        const err = mockState.nextConstructorError;
        mockState.nextConstructorError = null;
        throw err;
      }

      const instanceIndex = mockState.playerInstances.length;
      this.applyOpencastTheme = vi.fn(async () => {});
      this.loadManifest = vi.fn(async () => {
        if (mockState.blockFirstLoadManifest && instanceIndex === 0) {
          await new Promise<void>((resolve) => {
            mockState.firstLoadManifestResolver = resolve;
          });
        }
      });

      mockState.playerConstructorSpy(elem, initParams);
      mockState.playerInstances.push(this);
    }
  },
  opencastInitParamsDefaultImpl: {},
  stringToBoolean: (value: string | null) => {
    if (value == null) {
      return false;
    }
    return ['true', 'yes', '1'].includes(value.trim().toLowerCase());
  }
}));

vi.mock('@asicupv/paella-basic-plugins', () => ({ basicPlugins: [] }));
vi.mock('@asicupv/paella-slide-plugins', () => ({ slidePlugins: [] }));
vi.mock('@asicupv/paella-zoom-plugin', () => ({ zoomPlugins: [] }));
vi.mock('@asicupv/paella-webgl-plugins', () => ({ webglPlugins: [] }));
vi.mock('@asicupv/paella-video-plugins', () => ({ videoPlugins: [] }));
vi.mock('@asicupv/paella-extra-plugins', () => ({ extraPlugins: [] }));
vi.mock('@asicupv/paella-opencast-plugins', () => ({ opencastPlugins: [] }));

import '../src/index';
import { OpencastPaellaHTMLElement } from '../src/OpencastPaellaHTMLElement';

const flushDebounceAndMicrotasks = async () => {
  vi.advanceTimersByTime(60);
  await Promise.resolve();
  await Promise.resolve();
};

describe('OpencastPaellaHTMLElement', () => {
  let element: OpencastPaellaHTMLElement;
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    superGetLoggedUserNameSpy.mockClear();
    superCanWriteSpy.mockClear();
    playerConstructorSpy.mockClear();
    mockState.nextConstructorError = null;
    mockState.blockFirstLoadManifest = false;
    mockState.firstLoadManifestResolver = null;
    playerInstances.length = 0;

    document.body.innerHTML = '';
    element = new OpencastPaellaHTMLElement();
  });

  afterEach(() => {
    vi.useRealTimers();
    debugSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    document.body.innerHTML = '';
  });

  test('should be defined as custom element', () => {
    expect(customElements.get('paella-opencast-player')).toBeDefined();
  });

  test('should have correct observed attributes', () => {
    expect(OpencastPaellaHTMLElement.observedAttributes).toEqual([
      'video-id',
      'opencast-presentation-url',
      'paella-resources-url',
      'paella-config',
      'opencast-episode',
      'opencast-user-name',
      'opencast-user-canWrite'
    ]);
  });

  test('should create element instance and initialize with null paella', () => {
    expect(element).toBeInstanceOf(OpencastPaellaHTMLElement);
    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.paella).toBeNull();
  });

  test('should debounce connected and attribute updates into a single observable update', async () => {
    element.setAttribute('video-id', 'test-video-123');
    element.connectedCallback();
    element.attributeChangedCallback('video-id', 'old', 'new');

    await flushDebounceAndMicrotasks();

    expect(playerConstructorSpy).toHaveBeenCalledTimes(1);
    expect(playerInstances[0].applyOpencastTheme).toHaveBeenCalledTimes(1);
    expect(playerInstances[0].loadManifest).toHaveBeenCalledTimes(1);
    expect(element.paella).not.toBeNull();
  });

  test('should not update when attribute value does not change', async () => {
    element.attributeChangedCallback('video-id', 'same-value', 'same-value');
    await flushDebounceAndMicrotasks();

    expect(playerConstructorSpy).not.toHaveBeenCalled();
  });

  test('should warn and keep paella null when video-id is missing', async () => {
    element.connectedCallback();
    await flushDebounceAndMicrotasks();

    expect(warnSpy).toHaveBeenCalledWith(
      'No video-id attribute found. Opencast Paella Player Component will not be updated.'
    );
    expect(playerConstructorSpy).not.toHaveBeenCalled();
    expect(element.paella).toBeNull();
  });

  test('should handle update errors gracefully and remain reusable', async () => {
    mockState.nextConstructorError = new Error('Test constructor failure');

    element.innerHTML = '<div>stale-dom</div>';
    element.setAttribute('video-id', 'test-video-error');
    element.connectedCallback();
    await flushDebounceAndMicrotasks();

    expect(errorSpy).toHaveBeenCalled();
    expect(element.innerHTML).toBe('');
    expect(playerConstructorSpy).not.toHaveBeenCalled();

    element.connectedCallback();
    await flushDebounceAndMicrotasks();

    expect(playerConstructorSpy).toHaveBeenCalledTimes(1);
    expect(playerInstances[0].applyOpencastTheme).toHaveBeenCalledTimes(1);
    expect(playerInstances[0].loadManifest).toHaveBeenCalledTimes(1);
    expect(element.paella).not.toBeNull();
  });

  test('should process exactly one pending update while first update is running', async () => {
    mockState.blockFirstLoadManifest = true;
    element.setAttribute('video-id', 'pending-video');

    const firstUpdate = (element as any).enqueueUpdate();
    await Promise.resolve();
    await Promise.resolve();

    expect(playerConstructorSpy).toHaveBeenCalledTimes(1);
    expect(mockState.firstLoadManifestResolver).not.toBeNull();

    const secondUpdate = (element as any).enqueueUpdate();

    mockState.firstLoadManifestResolver?.();
    await Promise.all([firstUpdate, secondUpdate]);

    expect(playerConstructorSpy).toHaveBeenCalledTimes(2);
    expect(playerInstances[1].applyOpencastTheme).toHaveBeenCalledTimes(1);
    expect(playerInstances[1].loadManifest).toHaveBeenCalledTimes(1);
  });

  test('should clear content and release player on disconnectedCallback', async () => {
    element.setAttribute('video-id', 'video-disconnect');
    element.connectedCallback();
    await flushDebounceAndMicrotasks();

    expect(element.paella).not.toBeNull();

    element.innerHTML = '<div>connected-content</div>';
    element.disconnectedCallback();

    expect(element.paella).toBeNull();
    expect(element.innerHTML).toBe('');
  });

  test('should use opencast-user-canWrite attribute without calling parent auth', async () => {
    element.setAttribute('video-id', 'video-auth');
    element.setAttribute('opencast-user-canWrite', 'true');
    element.connectedCallback();
    await flushDebounceAndMicrotasks();

    const initParams = playerConstructorSpy.mock.calls[0][1];
    const auth = initParams.opencast.auth;
    const canWrite = await auth.canWrite();

    expect(canWrite).toBe(true);
    expect(superCanWriteSpy).not.toHaveBeenCalled();

    element.setAttribute('opencast-user-canWrite', 'false');
    const canWriteFalse = await auth.canWrite();
    expect(canWriteFalse).toBe(false);
    expect(superCanWriteSpy).not.toHaveBeenCalled();
  });

  test('should use opencast-user-name attribute without calling parent auth', async () => {
    element.setAttribute('video-id', 'video-user');
    element.setAttribute('opencast-user-name', 'component-user');
    element.connectedCallback();
    await flushDebounceAndMicrotasks();

    const initParams = playerConstructorSpy.mock.calls[0][1];
    const auth = initParams.opencast.auth;
    const userName = await auth.getLoggedUserName();

    expect(userName).toBe('component-user');
    expect(superGetLoggedUserNameSpy).not.toHaveBeenCalled();
  });
});