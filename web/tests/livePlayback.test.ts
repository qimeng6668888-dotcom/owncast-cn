import {
  attachLivePlayback,
  isFatalLiveLoadError,
  liveRecoveryAction,
  liveRetryDelayMs,
  MAX_LIVE_RECOVERY_ATTEMPTS,
  MEDIA_LOAD_ERROR_SNIPPET,
  PLAYLIST_ERROR_SNIPPET,
  shouldStartWithSound,
  VIEWER_PAUSE_GRACE_MS,
} from '../components/video/livePlayback';

describe('isFatalLiveLoadError', () => {
  test('the browser load-failure message is recoverable', () => {
    expect(
      isFatalLiveLoadError({
        code: 4,
        message: `${MEDIA_LOAD_ERROR_SNIPPET}, either because the server or network failed or because the format is not supported.`,
      }),
    ).toBe(true);
  });

  test('a stuck playlist error is recoverable', () => {
    expect(isFatalLiveLoadError({ code: 4, message: PLAYLIST_ERROR_SNIPPET })).toBe(true);
  });

  test('network, decode, and unsupported-source codes are recoverable', () => {
    expect(isFatalLiveLoadError({ code: 2, message: '' })).toBe(true);
    expect(isFatalLiveLoadError({ code: 3, message: '' })).toBe(true);
    expect(isFatalLiveLoadError({ code: 4, message: '' })).toBe(true);
  });

  test('an abort or a missing error is left alone', () => {
    expect(isFatalLiveLoadError({ code: 1, message: 'aborted' })).toBe(false);
    expect(isFatalLiveLoadError(null)).toBe(false);
  });
});

describe('liveRetryDelayMs', () => {
  test('backs off and then stays capped', () => {
    expect(liveRetryDelayMs(0)).toBe(1000);
    expect(liveRetryDelayMs(1)).toBe(2000);
    expect(liveRetryDelayMs(2)).toBe(4000);
    expect(liveRetryDelayMs(3)).toBe(8000);
    expect(liveRetryDelayMs(6)).toBe(8000);
  });

  test('stops after a handful of attempts', () => {
    expect(MAX_LIVE_RECOVERY_ATTEMPTS).toBe(6);
  });
});

const LIVE_SOURCE = 'https://play.example/hls/stream.m3u8';
const INTERRUPTED = '直播中断了，请点播放继续。';
const LOAD_ERROR = {
  code: 4,
  message: `${MEDIA_LOAD_ERROR_SNIPPET}, either because the server or network failed or because the format is not supported.`,
};

function createHarness(
  options: Partial<{
    autoplayMode: false | 'play' | 'any';
    initiallyMuted: boolean;
    readyState: number;
  }> = {},
) {
  let currentError: { code?: number; message?: string } | null = null;
  let readyState = options.readyState ?? 0;
  let currentTime = 0;
  let paused = true;
  let isMuted = false;
  let volume = 1;
  const sources: string[] = [];
  const playCalls: Array<Promise<void> | undefined> = [];
  const muteSets: boolean[] = [];
  let nextPlay: () => Promise<void> | undefined = () => Promise.resolve();
  const listeners = new Map<string, Array<() => void>>();
  const el = document.createElement('div');

  const emit = (event: string) => {
    (listeners.get(event) || []).slice().forEach(fn => fn());
  };

  const player = {
    // video.js uses one method to read and write. No args reads.
    // eslint-disable-next-line prefer-rest-params
    error(err?: { code?: number; message?: string } | null) {
      // eslint-disable-next-line prefer-rest-params
      if (arguments.length === 0) {
        return currentError;
      }
      currentError = err ?? null;
      if (err) {
        emit('error');
      }
      return currentError;
    },
    readyState: () => readyState,
    currentTime: () => currentTime,
    paused: () => paused,
    muted(value?: boolean) {
      if (value === undefined) {
        return isMuted;
      }
      muteSets.push(value);
      isMuted = value;
      emit('volumechange');
      return isMuted;
    },
    volume(value?: number) {
      if (value === undefined) {
        return volume;
      }
      volume = value;
      emit('volumechange');
      return volume;
    },
    play() {
      const result = nextPlay();
      playCalls.push(result);
      return result;
    },
    src(source: { src: string }) {
      sources.push(source.src);
    },
    on(event: string, handler: () => void) {
      const list = listeners.get(event) || [];
      list.push(handler);
      listeners.set(event, list);
    },
    off(event: string, handler: () => void) {
      listeners.set(
        event,
        (listeners.get(event) || []).filter(fn => fn !== handler),
      );
    },
    isDisposed: () => false,
    el: () => el,
    setReadyState(value: number) {
      readyState = value;
    },
    setCurrentTime(value: number) {
      currentTime = value;
    },
    setPaused(value: boolean) {
      paused = value;
    },
  };

  const cleanup = attachLivePlayback(player, {
    source: LIVE_SOURCE,
    autoplayMode: options.autoplayMode ?? 'play',
    initiallyMuted: options.initiallyMuted ?? false,
    interruptedMessage: INTERRUPTED,
    playlistMessage: '无法继续播放，没有可用的播放列表。',
  });

  return {
    player,
    sources,
    playCalls,
    muteSets,
    el,
    emit,
    cleanup,
    setNextPlay(fn: () => Promise<void> | undefined) {
      nextPlay = fn;
    },
  };
}

describe('liveRecoveryAction', () => {
  test('reloads a load failure even after playback had started', () => {
    expect(
      liveRecoveryAction({
        error: LOAD_ERROR,
        hasPlaybackData: true,
        attempts: 0,
      }),
    ).toBe('reload');
  });

  test('dismisses a playlist error once frames are already showing', () => {
    expect(
      liveRecoveryAction({
        error: { code: 4, message: PLAYLIST_ERROR_SNIPPET },
        hasPlaybackData: true,
        attempts: 0,
        playlistMessages: [PLAYLIST_ERROR_SNIPPET, '无法继续播放，没有可用的播放列表。'],
      }),
    ).toBe('dismiss');
  });

  test('reloads a playlist error when nothing is playing', () => {
    expect(
      liveRecoveryAction({
        error: { code: 4, message: '无法继续播放，没有可用的播放列表。' },
        hasPlaybackData: false,
        attempts: 2,
        playlistMessages: [PLAYLIST_ERROR_SNIPPET, '无法继续播放，没有可用的播放列表。'],
      }),
    ).toBe('reload');
  });

  test('gives up after the attempt cap', () => {
    expect(
      liveRecoveryAction({
        error: LOAD_ERROR,
        hasPlaybackData: false,
        attempts: MAX_LIVE_RECOVERY_ATTEMPTS,
      }),
    ).toBe('give-up');
  });

  test('leaves an abort alone', () => {
    expect(
      liveRecoveryAction({
        error: { code: 1, message: 'aborted' },
        hasPlaybackData: false,
        attempts: 0,
      }),
    ).toBe('ignore');
  });
});

describe('shouldStartWithSound', () => {
  const ready = {
    autoplayMode: 'play' as const,
    initiallyMuted: false,
    viewerMuted: false,
    viewerPaused: false,
    alreadyAudible: false,
    blockedByBrowser: false,
  };

  test('starts audible when autoplay is play-with-sound', () => {
    expect(shouldStartWithSound(ready)).toBe(true);
  });

  test('does not start when autoplay is off, the viewer muted, or the browser blocked it', () => {
    expect(shouldStartWithSound({ ...ready, autoplayMode: false })).toBe(false);
    expect(shouldStartWithSound({ ...ready, initiallyMuted: true })).toBe(false);
    expect(shouldStartWithSound({ ...ready, viewerMuted: true })).toBe(false);
    expect(shouldStartWithSound({ ...ready, viewerPaused: true })).toBe(false);
    expect(shouldStartWithSound({ ...ready, alreadyAudible: true })).toBe(false);
    expect(shouldStartWithSound({ ...ready, blockedByBrowser: true })).toBe(false);
    expect(shouldStartWithSound({ ...ready, autoplayMode: 'any' })).toBe(false);
  });
});

describe('attachLivePlayback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('reloads the live source after a fatal error and then plays with sound', () => {
    const { player, sources, playCalls, muteSets, emit } = createHarness();
    player.volume(0);
    player.setCurrentTime(40);
    player.setReadyState(4);
    player.error(LOAD_ERROR);

    expect(player.error()).toBeNull();
    expect(sources).toEqual([]);

    jest.advanceTimersByTime(999);
    expect(sources).toEqual([]);
    jest.advanceTimersByTime(1);
    expect(sources).toEqual([LIVE_SOURCE]);

    player.setPaused(true);
    emit('pause');
    player.setReadyState(4);
    emit('canplay');

    expect(playCalls).toHaveLength(1);
    expect(player.volume()).toBe(1);
    expect(player.muted()).toBe(false);
    expect(muteSets).not.toContain(true);
  });

  test('backs off across failures and then asks the viewer to press play', () => {
    const { player, sources } = createHarness();
    const delays = [1000, 2000, 4000, 8000, 8000, 8000];
    delays.forEach(delay => {
      player.error(LOAD_ERROR);
      jest.advanceTimersByTime(delay);
    });
    expect(sources).toEqual(Array(6).fill(LIVE_SOURCE));

    player.error(LOAD_ERROR);
    jest.advanceTimersByTime(8000);
    expect(sources).toHaveLength(6);
    expect(player.error()).toEqual({ code: 4, message: INTERRUPTED });
  });

  test('a click after giving up loads the live source again', () => {
    const { player, sources, el, playCalls } = createHarness();
    const delays = [1000, 2000, 4000, 8000, 8000, 8000];
    delays.forEach(delay => {
      player.error(LOAD_ERROR);
      jest.advanceTimersByTime(delay);
    });
    player.error(LOAD_ERROR);

    const mute = document.createElement('button');
    mute.className = 'vjs-mute-control';
    el.appendChild(mute);
    mute.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(sources).toHaveLength(6);

    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(sources).toHaveLength(7);
    expect(sources[6]).toBe(LIVE_SOURCE);
    expect(playCalls).toHaveLength(1);
  });

  test('clears a playlist error that appears while video is showing', () => {
    const { player, sources } = createHarness();
    player.setCurrentTime(12);
    player.setReadyState(4);
    player.error({ code: 4, message: PLAYLIST_ERROR_SNIPPET });
    expect(player.error()).toBeNull();
    jest.advanceTimersByTime(10000);
    expect(sources).toEqual([]);
  });

  test('ignores an aborted playback', () => {
    const { player, sources } = createHarness();
    player.error({ code: 1, message: 'aborted' });
    jest.advanceTimersByTime(5000);
    expect(sources).toEqual([]);
    expect(player.error()).toEqual({ code: 1, message: 'aborted' });
  });

  test('a pause caused by the error does not block the restarted playback', () => {
    const { player, emit, playCalls } = createHarness();
    player.error(LOAD_ERROR);
    player.setPaused(true);
    emit('pause');
    jest.advanceTimersByTime(VIEWER_PAUSE_GRACE_MS + 1000);
    player.setReadyState(4);
    emit('canplay');
    expect(playCalls).toHaveLength(1);
  });

  test('a viewer pause is left paused', () => {
    const { player, emit, playCalls } = createHarness();
    player.setPaused(true);
    emit('pause');
    jest.advanceTimersByTime(VIEWER_PAUSE_GRACE_MS);
    emit('canplay');
    expect(playCalls).toHaveLength(0);
  });

  test('a browser autoplay block leaves the play button and does not mute', async () => {
    const blocked = Object.assign(new Error('blocked'), { name: 'NotAllowedError' });
    const { player, emit, playCalls, setNextPlay, muteSets } = createHarness();
    setNextPlay(() => Promise.reject(blocked));
    player.setReadyState(4);
    emit('canplay');
    await Promise.resolve();
    expect(playCalls).toHaveLength(1);
    expect(player.muted()).toBe(false);
    expect(muteSets).not.toContain(true);

    emit('canplay');
    expect(playCalls).toHaveLength(1);
  });

  test('a saved volume of 0 still starts with sound, and a later mute sticks', async () => {
    const { player, emit, playCalls } = createHarness();
    player.volume(0);
    emit('canplay');
    await Promise.resolve();
    expect(playCalls).toHaveLength(1);
    expect(player.volume()).toBe(1);
    expect(player.muted()).toBe(false);

    player.muted(true);
    player.volume(0);
    emit('canplay');
    expect(playCalls).toHaveLength(1);
    expect(player.volume()).toBe(0);

    const off = createHarness({ autoplayMode: false });
    off.emit('canplay');
    expect(off.playCalls).toHaveLength(0);
  });

  test('starts with sound immediately when the media is already playable', () => {
    const { playCalls, player } = createHarness({ readyState: 3 });
    expect(playCalls).toHaveLength(1);
    expect(player.muted()).toBe(false);
  });

  test('playing again resets the backoff', () => {
    const { player, sources, emit } = createHarness();
    player.error(LOAD_ERROR);
    jest.advanceTimersByTime(1000);
    expect(sources).toHaveLength(1);
    emit('playing');

    player.error(LOAD_ERROR);
    jest.advanceTimersByTime(1000);
    expect(sources).toHaveLength(2);
  });

  test('cleanup stops further reloads', () => {
    const { player, sources, cleanup } = createHarness();
    cleanup();
    player.error(LOAD_ERROR);
    jest.advanceTimersByTime(5000);
    expect(sources).toEqual([]);
  });
});
