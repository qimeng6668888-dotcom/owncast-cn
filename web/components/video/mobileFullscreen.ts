// Phones show a text fullscreen button. Android then uses video.js full-window
// mode (in-page fullscreen) so Chrome does not paint its "swipe from the top"
// toast; the exit control and the bar hide together after the inactivity
// timeout. iPhone and iPad keep that text button, then hand the tap to the
// system video player (webkitEnterFullScreen).

export const FULLSCREEN_HIDE_MS = 2000;
const HISTORY_KEY = 'ocPseudoFs';

export type MatchMediaQuery = (query: string) => boolean;

export type DeviceHints = {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  screenWidth?: number;
};

export type ScreenHints = {
  screenWidth: number;
  maxTouchPoints: number;
};

// Marks the player whose control bar uses the even phone layout.
export const PHONE_CONTROLS_CLASS = 'oc-phone-controls';

type WebkitVideo = HTMLVideoElement & {
  webkitEnterFullScreen?: () => void;
  webkitEnterFullscreen?: () => void;
};

export type MobileFullscreenLabels = {
  enterLabel: string;
  exitLabel: string;
};

type FullscreenButton = {
  el: () => HTMLElement;
  controlText: (text: string) => void;
  handleFullscreenChange?: (event?: Event) => void;
};

export type MobileFullscreenPlayer = {
  el: () => HTMLElement;
  isFullWindow?: boolean;
  isFullscreen: () => boolean;
  enterFullWindow: () => void;
  exitFullWindow: () => void;
  requestFullscreen: (...args: unknown[]) => unknown;
  exitFullscreen: () => unknown;
  userActive: (active?: boolean) => boolean | void;
  reportUserActivity?: (event?: Event) => void;
  on: (event: string, fn: () => void) => void;
  off?: (event: string, fn: () => void) => void;
  options_?: { inactivityTimeout?: number };
  controlBar?: {
    getChild: (name: string) => FullscreenButton | null | undefined;
  };
};

// A phone is a narrow touch screen. Pointer and hover queries miss on some
// Android browsers, which then kept the desktop fullscreen icon. Screen width
// plus touch points catches those. A desktop window dragged narrow stays on
// the browser fullscreen button because the monitor itself is wide.
export const prefersPseudoFullscreen = (
  match: MatchMediaQuery,
  screen: ScreenHints = {
    screenWidth: typeof window === 'undefined' ? 0 : window.screen?.width || 0,
    maxTouchPoints: typeof navigator === 'undefined' ? 0 : navigator.maxTouchPoints || 0,
  },
): boolean => {
  const narrowViewport = match('(max-width: 1024px)');
  const coarse = match('(pointer: coarse)') || match('(hover: none)');
  const narrowDevice = screen.screenWidth > 0 && screen.screenWidth <= 1024;
  return (
    (narrowDevice && screen.maxTouchPoints > 0) ||
    (narrowViewport && (coarse || screen.maxTouchPoints > 1))
  );
};

export const isAppleTouch = (nav: DeviceHints): boolean => {
  if (/iPad|iPhone|iPod/i.test(nav.userAgent)) {
    return true;
  }
  // iPadOS 13+ reports a desktop Mac user agent and platform.
  return nav.platform === 'MacIntel' && nav.maxTouchPoints > 1;
};

const deviceHints = (): DeviceHints => ({
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  maxTouchPoints: navigator.maxTouchPoints || 0,
  screenWidth: window.screen?.width || 0,
});

const screenHints = (nav: DeviceHints): ScreenHints => ({
  screenWidth: nav.screenWidth ?? (typeof window === 'undefined' ? 0 : window.screen?.width || 0),
  maxTouchPoints: nav.maxTouchPoints || 0,
});

const enterApplePlayer = (root: HTMLElement): boolean => {
  const video = root.querySelector('video') as WebkitVideo | null;
  const enter = video?.webkitEnterFullScreen || video?.webkitEnterFullscreen;
  if (!video || !enter) {
    return false;
  }
  enter.call(video);
  return true;
};

const fullscreenButton = (player: MobileFullscreenPlayer): FullscreenButton | null => {
  const bar = player.controlBar;
  if (!bar) {
    return null;
  }
  return bar.getChild('fullscreenToggle') || bar.getChild('FullscreenToggle') || null;
};

export const paintFullscreenLabel = (buttonEl: HTMLElement, label: string) => {
  buttonEl.classList.add('oc-fullscreen-text');
  buttonEl.setAttribute('aria-label', label);
  const icon = buttonEl.querySelector('.vjs-icon-placeholder');
  if (icon) {
    icon.setAttribute('aria-hidden', 'true');
  }
  // video.js keeps a clipped copy of the same word for tooltips. Hide it so
  // the visible label is the only "全屏" on the button.
  const clipped = buttonEl.querySelector('.vjs-control-text');
  if (clipped) {
    clipped.setAttribute('aria-hidden', 'true');
    clipped.textContent = '';
  }
  const host = icon || buttonEl;
  let text = host.querySelector('.oc-fs-label');
  if (!text) {
    text = document.createElement('span');
    text.className = 'oc-fs-label';
    host.appendChild(text);
  }
  text.textContent = label;
};

const nudgeActivity = (player: MobileFullscreenPlayer) => {
  player.reportUserActivity?.();
  if (!player.userActive()) {
    player.userActive(true);
  }
};

const installAppleFullscreen = (
  player: MobileFullscreenPlayer,
  labels: MobileFullscreenLabels,
): (() => void) => {
  const originalRequest = player.requestFullscreen.bind(player);
  const button = fullscreenButton(player);
  const video = player.el().querySelector('video');

  const paintEnter = () => {
    if (!button) {
      return;
    }
    button.controlText(labels.enterLabel);
    paintFullscreenLabel(button.el(), labels.enterLabel);
  };

  player.requestFullscreen = () => {
    if (!enterApplePlayer(player.el())) {
      return originalRequest();
    }
    return Promise.resolve();
  };

  if (button) {
    button.handleFullscreenChange = () => {
      paintEnter();
    };
    paintEnter();
  }

  const onEnd = () => {
    paintEnter();
  };
  video?.addEventListener('webkitendfullscreen', onEnd);

  const onDispose = () => {
    video?.removeEventListener('webkitendfullscreen', onEnd);
    player.requestFullscreen = originalRequest;
  };
  player.on('dispose', onDispose);

  return () => {
    player.off?.('dispose', onDispose);
    onDispose();
  };
};

export const installMobileFullscreen = (
  player: MobileFullscreenPlayer,
  labels: MobileFullscreenLabels,
  match: MatchMediaQuery = query => window.matchMedia(query).matches,
  nav: DeviceHints = deviceHints(),
): (() => void) => {
  const markPhoneBar = () => {
    player.el().classList.add(PHONE_CONTROLS_CLASS);
  };
  const unmarkPhoneBar = () => {
    player.el().classList.remove(PHONE_CONTROLS_CLASS);
  };

  // iPhone and iPad use Apple's player at any width, including landscape.
  if (isAppleTouch(nav)) {
    markPhoneBar();
    const detach = installAppleFullscreen(player, labels);
    return () => {
      detach();
      unmarkPhoneBar();
    };
  }

  if (!prefersPseudoFullscreen(match, screenHints(nav))) {
    return () => {};
  }

  markPhoneBar();

  if (player.options_) {
    player.options_.inactivityTimeout = FULLSCREEN_HIDE_MS;
  }

  const originalRequest = player.requestFullscreen.bind(player);
  const originalExit = player.exitFullscreen.bind(player);
  const button = fullscreenButton(player);
  let pushed = false;
  let suppressPop = false;

  const paintEnter = () => {
    if (!button) {
      return;
    }
    button.controlText(labels.enterLabel);
    paintFullscreenLabel(button.el(), labels.enterLabel);
  };

  const exitBtn = document.createElement('button');
  exitBtn.type = 'button';
  exitBtn.className = 'oc-exit-fullscreen';
  exitBtn.textContent = labels.exitLabel;
  exitBtn.setAttribute('aria-label', labels.exitLabel);
  player.el().appendChild(exitBtn);

  const leave = (fromPop: boolean) => {
    if (player.isFullWindow) {
      player.exitFullWindow();
    }
    paintEnter();
    if (fromPop) {
      pushed = false;
      return;
    }
    if (pushed) {
      pushed = false;
      suppressPop = true;
      window.history.back();
    }
  };

  const enter = () => {
    if (!player.isFullWindow) {
      window.history.pushState({ [HISTORY_KEY]: true }, '');
      pushed = true;
    }
    player.enterFullWindow();
    paintEnter();
    nudgeActivity(player);
  };

  player.requestFullscreen = () => {
    enter();
    return Promise.resolve();
  };
  player.exitFullscreen = () => {
    leave(false);
    return Promise.resolve();
  };

  if (button) {
    button.handleFullscreenChange = () => {
      paintEnter();
    };
    paintEnter();
  }

  const onExitClick = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    player.exitFullscreen();
  };
  exitBtn.addEventListener('click', onExitClick);

  const onPop = () => {
    if (suppressPop) {
      suppressPop = false;
      return;
    }
    leave(true);
  };
  window.addEventListener('popstate', onPop);

  const onDispose = () => {
    window.removeEventListener('popstate', onPop);
    exitBtn.remove();
    unmarkPhoneBar();
    player.requestFullscreen = originalRequest;
    player.exitFullscreen = originalExit;
    if (player.isFullWindow) {
      player.exitFullWindow();
    }
  };
  player.on('dispose', onDispose);

  return () => {
    player.off?.('dispose', onDispose);
    onDispose();
  };
};
