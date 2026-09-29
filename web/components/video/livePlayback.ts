// Live playback recovery and audible start.
// A dropped ingest or a phone that falls behind the playlist makes video.js
// raise a fatal media error and then sit on that message. These helpers reload
// the live source, and start playback with sound once the media can play.

export const MEDIA_LOAD_ERROR_SNIPPET = 'The media could not be loaded';
export const PLAYLIST_ERROR_SNIPPET = 'No available working or supported playlists';

const MAX_LIVE_RETRY_DELAY_MS = 8000;

export const VIEWER_PAUSE_GRACE_MS = 400;

export type PlaybackError = { code?: number; message?: string } | null;

export type LiveRecoveryAction = 'ignore' | 'dismiss' | 'reload' | 'give-up';

export function isFatalLiveLoadError(error: PlaybackError | undefined): boolean {
  if (!error) {
    return false;
  }
  const message = String(error.message || '');
  if (message.includes(MEDIA_LOAD_ERROR_SNIPPET) || message.includes(PLAYLIST_ERROR_SNIPPET)) {
    return true;
  }
  const code = Number(error.code);
  return code === 2 || code === 3 || code === 4;
}

// attempt is how many reloads have already been scheduled. The first wait is
// one second, then it doubles until it stays at eight seconds.
export function liveRetryDelayMs(attempt: number): number {
  const step = Math.max(0, attempt);
  return Math.min(MAX_LIVE_RETRY_DELAY_MS, 1000 * 2 ** step);
}

export const MAX_LIVE_RECOVERY_ATTEMPTS = 6;

export function liveRecoveryAction(input: {
  error: PlaybackError | undefined;
  hasPlaybackData: boolean;
  attempts: number;
  playlistMessages?: string[];
}): LiveRecoveryAction {
  if (!isFatalLiveLoadError(input.error)) {
    return 'ignore';
  }
  const message = String(input.error?.message || '');
  const playlistMessages = input.playlistMessages?.filter(Boolean) ?? [PLAYLIST_ERROR_SNIPPET];
  const isPlaylist = playlistMessages.some(snippet => message.includes(snippet));
  // A playlist complaint while frames are already on screen is a stale
  // overlay. Any other fatal error, including one after the viewer had been
  // watching, means this live source has to be loaded again.
  if (isPlaylist && input.hasPlaybackData) {
    return 'dismiss';
  }
  if (input.attempts >= MAX_LIVE_RECOVERY_ATTEMPTS) {
    return 'give-up';
  }
  return 'reload';
}

export function shouldStartWithSound(input: {
  autoplayMode: false | 'play' | 'any';
  initiallyMuted: boolean;
  viewerMuted: boolean;
  viewerPaused: boolean;
  alreadyAudible: boolean;
  blockedByBrowser: boolean;
}): boolean {
  if (input.autoplayMode !== 'play') {
    return false;
  }
  // An embed can still ask to start muted. A mute the viewer chooses after
  // playback has begun also sticks. A volume of 0 left over from an older
  // muted autoplay does not: load completion turns the sound on.
  if (input.initiallyMuted || input.viewerMuted) {
    return false;
  }
  if (input.viewerPaused || input.alreadyAudible || input.blockedByBrowser) {
    return false;
  }
  return true;
}

export function isAutoplayBlockedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const named = error as { name?: string; message?: string };
  if (named.name === 'NotAllowedError') {
    return true;
  }
  return String(named.message || '').includes('NotAllowedError');
}

export interface LivePlaybackPlayer {
  error(err?: PlaybackError): PlaybackError;
  readyState(): number;
  currentTime(): number;
  paused(): boolean;
  muted(value?: boolean): boolean;
  volume(value?: number): number;
  play(): Promise<void> | undefined;
  src(source: { src: string; type: string }): void;
  on(event: string, handler: () => void): void;
  off(event: string, handler: () => void): void;
  isDisposed(): boolean;
  el(): EventTarget;
}

export type LivePlaybackOptions = {
  source: string;
  autoplayMode: false | 'play' | 'any';
  initiallyMuted: boolean;
  interruptedMessage: string;
  playlistMessage: string;
};

const LIVE_SOURCE_TYPE = 'application/x-mpegURL';

// Wires fatal-error reload and audible autoplay. Returns a cleanup function.
export function attachLivePlayback(
  player: LivePlaybackPlayer,
  options: LivePlaybackOptions,
): () => void {
  let recoveryAttempts = 0;
  let gaveUp = false;
  let recoveryPending = false;
  let viewerPaused = false;
  let viewerMuted = false;
  let soundOpened = false;
  let blockedByBrowser = false;
  let audibleStartInFlight = false;
  let recoveryTimer: ReturnType<typeof setTimeout> | null = null;
  let pauseTimer: ReturnType<typeof setTimeout> | null = null;
  let cleaned = false;

  const clearRecoveryTimer = () => {
    if (recoveryTimer !== null) {
      clearTimeout(recoveryTimer);
      recoveryTimer = null;
    }
  };

  const clearPauseTimer = () => {
    if (pauseTimer !== null) {
      clearTimeout(pauseTimer);
      pauseTimer = null;
    }
  };

  const disposed = () => {
    try {
      return player.isDisposed();
    } catch {
      return true;
    }
  };

  const reloadLive = () => {
    if (disposed()) {
      return;
    }
    player.error(null);
    player.src({ src: options.source, type: LIVE_SOURCE_TYPE });
  };

  const startWithSound = () => {
    if (disposed() || audibleStartInFlight || gaveUp) {
      return;
    }
    const alreadyAudible = !player.paused() && !player.muted() && player.volume() > 0;
    if (
      !shouldStartWithSound({
        autoplayMode: options.autoplayMode,
        initiallyMuted: options.initiallyMuted,
        viewerMuted,
        viewerPaused,
        alreadyAudible,
        blockedByBrowser,
      })
    ) {
      return;
    }
    audibleStartInFlight = true;
    soundOpened = true;
    player.muted(false);
    if (player.volume() === 0) {
      player.volume(1);
    }
    let pending: Promise<void> | undefined;
    try {
      pending = player.play();
    } catch (err) {
      audibleStartInFlight = false;
      if (!viewerPaused && isAutoplayBlockedError(err)) {
        blockedByBrowser = true;
      }
      return;
    }
    if (pending && typeof pending.then === 'function') {
      pending.then(
        () => {
          audibleStartInFlight = false;
        },
        (err: unknown) => {
          audibleStartInFlight = false;
          if (viewerPaused) {
            return;
          }
          if (isAutoplayBlockedError(err)) {
            blockedByBrowser = true;
          }
        },
      );
      return;
    }
    audibleStartInFlight = false;
  };

  const onVolumeChange = () => {
    // Ignore the volume restored from the last visit, and the unmute this
    // helper performs. A mute only sticks after sound has been opened.
    if (!soundOpened || audibleStartInFlight || disposed()) {
      return;
    }
    viewerMuted = player.muted() || player.volume() === 0;
  };

  const onCanPlay = () => {
    startWithSound();
    recoveryPending = false;
  };

  const onPlaying = () => {
    recoveryAttempts = 0;
    gaveUp = false;
    recoveryPending = false;
    blockedByBrowser = false;
    viewerPaused = false;
    clearRecoveryTimer();
  };

  const onPause = () => {
    // video.js pauses when it raises a fatal error. That pause is not the
    // viewer, so a recovery in progress must not be treated as one.
    if (recoveryPending || gaveUp || disposed()) {
      return;
    }
    clearPauseTimer();
    pauseTimer = setTimeout(() => {
      pauseTimer = null;
      if (disposed() || recoveryPending || player.error() || !player.paused()) {
        return;
      }
      viewerPaused = true;
    }, VIEWER_PAUSE_GRACE_MS);
  };

  const onError = () => {
    if (gaveUp || disposed()) {
      return;
    }
    const err = player.error();
    const hasPlaybackData = player.readyState() >= 2 || player.currentTime() > 0;
    const action = liveRecoveryAction({
      error: err,
      hasPlaybackData,
      attempts: recoveryAttempts,
      playlistMessages: [PLAYLIST_ERROR_SNIPPET, options.playlistMessage],
    });
    if (action === 'ignore' || !err) {
      return;
    }
    if (action === 'dismiss') {
      player.error(null);
      return;
    }
    if (action === 'give-up') {
      gaveUp = true;
      recoveryPending = false;
      clearRecoveryTimer();
      player.error({ code: err.code || 2, message: options.interruptedMessage });
      return;
    }
    recoveryPending = true;
    clearPauseTimer();
    const delay = liveRetryDelayMs(recoveryAttempts);
    recoveryAttempts += 1;
    player.error(null);
    clearRecoveryTimer();
    recoveryTimer = setTimeout(() => {
      recoveryTimer = null;
      if (disposed() || gaveUp) {
        return;
      }
      reloadLive();
    }, delay);
  };

  const resumeFromGiveUp = () => {
    gaveUp = false;
    recoveryAttempts = 0;
    blockedByBrowser = false;
    viewerPaused = false;
    recoveryPending = true;
    audibleStartInFlight = false;
    clearRecoveryTimer();
    try {
      reloadLive();
      const pending = player.play();
      if (pending && typeof pending.catch === 'function') {
        pending.catch(() => {
          // The click already counted as the gesture. A later canplay retries.
        });
      }
    } catch {
      recoveryPending = false;
    }
  };

  const onClick = (event: Event) => {
    const { target } = event;
    if (target instanceof Element && target.closest('.vjs-mute-control, .vjs-volume-panel')) {
      return;
    }
    if (!gaveUp) {
      return;
    }
    resumeFromGiveUp();
  };

  const cleanup = () => {
    if (cleaned) {
      return;
    }
    cleaned = true;
    clearRecoveryTimer();
    clearPauseTimer();
    try {
      player.off('error', onError);
      player.off('canplay', onCanPlay);
      player.off('playing', onPlaying);
      player.off('pause', onPause);
      player.off('volumechange', onVolumeChange);
      player.off('dispose', cleanup);
      player.el().removeEventListener('click', onClick);
    } catch {
      // The player is already tearing down.
    }
  };

  player.on('error', onError);
  player.on('canplay', onCanPlay);
  player.on('playing', onPlaying);
  player.on('pause', onPause);
  player.on('volumechange', onVolumeChange);
  player.on('dispose', cleanup);
  try {
    player.el().addEventListener('click', onClick);
  } catch {
    // No element yet; give-up still leaves the message.
  }

  if (player.readyState() >= 3) {
    onCanPlay();
  }

  return cleanup;
}
