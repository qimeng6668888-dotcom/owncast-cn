// Phone fullscreen stays inside the page (video.js full-window) instead of the
// browser Fullscreen API. Android Chrome's Fullscreen API paints its own
// "swipe from the top, then tap back" toast, and that gesture often does not
// leave the player. Full-window mode keeps our controls, so we can offer an
// explicit exit and let the player hide them after its inactivity timeout.
// That hide is the usual "immersive" / auto-hide chrome behavior.

export const FULLSCREEN_HIDE_MS = 2000;
const HISTORY_KEY = 'ocPseudoFs';

export type MatchMediaQuery = (query: string) => boolean;

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

export const prefersPseudoFullscreen = (match: MatchMediaQuery): boolean =>
  match('(width <= 1024px) and (hover: none)') || match('(width <= 1024px) and (pointer: coarse)');

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

export const installMobileFullscreen = (
  player: MobileFullscreenPlayer,
  labels: MobileFullscreenLabels,
  match: MatchMediaQuery = query => window.matchMedia(query).matches,
): (() => void) => {
  if (!prefersPseudoFullscreen(match)) {
    return () => {};
  }

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
