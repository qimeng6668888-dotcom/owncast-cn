export type Translate = (key: string, vars?: Record<string, unknown>) => string;

/** video.js looks these up by the English control name. */
export const PLAYER_STRING_KEYS = [
  'Play',
  'Pause',
  'Mute',
  'Unmute',
  'Fullscreen',
  'Non-Fullscreen',
  'Picture-in-Picture',
  'Exit Picture-in-Picture',
  'Playback Rate',
  'Progress Bar',
  'Volume Level',
  'Captions',
  'Subtitles',
  'Current Time',
  'Duration',
  'Loaded',
  'Progress',
  'Seek to live, currently behind live',
  'Seek to live, currently playing live',
  'LIVE',
  'Close Modal Dialog',
  'Descriptions',
  'Chapters',
  'Replay',
  'Remaining Time',
  'Play Video',
  'Audio Player',
  'Video Player',
  'Modal Window',
  'This is a modal window',
  'This modal can be closed by pressing the Escape key or activating the close button.',
  'You aborted the media playback',
  'A network error caused the media download to fail part-way.',
  'The media could not be loaded, either because the server or network failed or because the format is not supported.',
  'The media playback was aborted due to a corruption problem or because the media used features your browser did not support.',
  'No compatible source was found for this media.',
  'The media is encrypted and we do not have the keys to decrypt it.',
  'Auto',
  'Settings',
  'Minimize latency',
  'Minimize latency help',
  'On',
  'Off',
] as const;

const SHORTCUT_SUFFIXES: Record<string, string> = {
  Play: ' (Space)',
  Pause: ' (Space)',
  Mute: ' (m)',
  Unmute: ' (m)',
  Fullscreen: ' (f)',
  'Non-Fullscreen': ' (f)',
  'Picture-in-Picture': ' (i)',
  'Exit Picture-in-Picture': ' (i)',
};

/** Returns the catalog string, or the fallback when the key is missing. */
export const translated = (t: Translate, key: string, fallback: string): string => {
  const value = t(key);
  return !value || value === key ? fallback : value;
};

/** Language pack registered with video.js for the active UI locale. */
export const playerLanguagePack = (t: Translate): Record<string, string> => {
  const pack: Record<string, string> = {};
  PLAYER_STRING_KEYS.forEach(name => {
    const key = `Frontend.Player.${name}`;
    pack[name] = translated(t, key, name);
  });
  Object.entries(SHORTCUT_SUFFIXES).forEach(([name, suffix]) => {
    pack[name] = `${pack[name]}${suffix}`;
  });
  return pack;
};
