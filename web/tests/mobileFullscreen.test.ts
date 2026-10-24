/**
 * @jest-environment jsdom
 */

import {
  FULLSCREEN_HIDE_MS,
  installMobileFullscreen,
  isAppleTouch,
  paintFullscreenLabel,
  prefersPseudoFullscreen,
  type MobileFullscreenPlayer,
} from '../components/video/mobileFullscreen';

const phoneMatch = (query: string) =>
  query.includes('pointer: coarse') || query.includes('hover: none');

const desktopMatch = () => false;

const makePlayer = (): MobileFullscreenPlayer & {
  requests: string[];
  disposed: boolean;
} => {
  const root = document.createElement('div');
  const buttonEl = document.createElement('button');
  buttonEl.className = 'vjs-fullscreen-control';
  buttonEl.innerHTML = '<span class="vjs-icon-placeholder"></span>';
  root.appendChild(buttonEl);
  document.body.appendChild(root);

  const player = {
    requests: [] as string[],
    disposed: false,
    isFullWindow: false,
    options_: { inactivityTimeout: 0 },
    el: () => root,
    isFullscreen() {
      return this.isFullWindow;
    },
    enterFullWindow() {
      this.isFullWindow = true;
      this.requests.push('enter-window');
    },
    exitFullWindow() {
      this.isFullWindow = false;
      this.requests.push('exit-window');
    },
    requestFullscreen() {
      this.requests.push('native-request');
      return Promise.resolve();
    },
    exitFullscreen() {
      this.requests.push('native-exit');
      return Promise.resolve();
    },
    userActive(active?: boolean) {
      if (active === undefined) {
        return true;
      }
      return undefined;
    },
    reportUserActivity() {
      this.requests.push('activity');
    },
    on(event: string, fn: () => void) {
      if (event === 'dispose') {
        this.disposed = true;
        root.addEventListener('dispose', fn);
      }
    },
    off() {},
    controlBar: {
      getChild: () => ({
        el: () => buttonEl,
        controlText() {},
        handleFullscreenChange() {},
      }),
    },
  };

  return player;
};

describe('isAppleTouch', () => {
  test('iPhone and desktop-mode iPad count as Apple', () => {
    expect(
      isAppleTouch({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)',
        platform: 'iPhone',
        maxTouchPoints: 5,
      }),
    ).toBe(true);
    expect(
      isAppleTouch({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      }),
    ).toBe(true);
  });

  test('Android does not count as Apple', () => {
    expect(
      isAppleTouch({
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7)',
        platform: 'Linux armv8l',
        maxTouchPoints: 5,
      }),
    ).toBe(false);
  });
});

describe('prefersPseudoFullscreen', () => {
  test('phones use in-page fullscreen', () => {
    expect(prefersPseudoFullscreen(phoneMatch)).toBe(true);
  });

  test('desktop keeps the browser fullscreen API', () => {
    expect(prefersPseudoFullscreen(desktopMatch)).toBe(false);
  });
});

describe('installMobileFullscreen', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('desktop install does not replace fullscreen', () => {
    const player = makePlayer();
    const detach = installMobileFullscreen(
      player,
      { enterLabel: '全屏', exitLabel: '退出全屏' },
      desktopMatch,
    );
    player.requestFullscreen();
    expect(player.requests).toEqual(['native-request']);
    expect(player.options_.inactivityTimeout).toBe(0);
    detach();
  });

  test('phone fullscreen is full-window, labeled 全屏, with an exit control', () => {
    const player = makePlayer();
    installMobileFullscreen(player, { enterLabel: '全屏', exitLabel: '退出全屏' }, phoneMatch);

    expect(player.options_.inactivityTimeout).toBe(FULLSCREEN_HIDE_MS);
    expect(player.el().querySelector('.oc-fs-label')?.textContent).toBe('全屏');
    expect(player.el().querySelector('.oc-exit-fullscreen')?.textContent).toBe('退出全屏');

    player.requestFullscreen();
    expect(player.requests).toContain('enter-window');
    expect(player.requests).not.toContain('native-request');
    expect(player.isFullWindow).toBe(true);

    const exit = player.el().querySelector('.oc-exit-fullscreen') as HTMLButtonElement;
    exit.click();
    expect(player.isFullWindow).toBe(false);
    expect(player.requests).not.toContain('native-exit');
  });

  test('iPhone keeps the text button and opens the system player', () => {
    const player = makePlayer();
    const video = document.createElement('video');
    let entered = 0;
    Object.assign(video, {
      webkitEnterFullScreen: () => {
        entered += 1;
      },
    });
    player.el().appendChild(video);

    installMobileFullscreen(
      player,
      { enterLabel: '全屏', exitLabel: '退出全屏' },
      phoneMatch,
      {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)',
        platform: 'iPhone',
        maxTouchPoints: 5,
      },
    );

    expect(player.el().querySelector('.oc-fs-label')?.textContent).toBe('全屏');
    expect(player.el().querySelector('.oc-exit-fullscreen')).toBeNull();
    player.requestFullscreen();
    expect(entered).toBe(1);
    expect(player.isFullWindow).toBe(false);
    expect(player.requests).not.toContain('enter-window');
    expect(player.requests).not.toContain('native-request');
  });
});

describe('paintFullscreenLabel', () => {
  test('replaces the icon placeholder with the text label', () => {
    const button = document.createElement('button');
    button.innerHTML = '<span class="vjs-icon-placeholder"></span>';
    paintFullscreenLabel(button, '全屏');
    expect(button.querySelector('.oc-fs-label')?.textContent).toBe('全屏');
    expect(button.classList.contains('oc-fullscreen-text')).toBe(true);
  });
});
