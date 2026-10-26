import { appearanceWithBrand, isBrandHex, readBrandColors } from '../utils/branding';
import { playerLanguagePack } from '../utils/playerLanguage';

describe('brand colors', () => {
  test('reads saved primary and accent', () => {
    expect(
      readBrandColors({
        'brand-primary': '#112233',
        'brand-accent': '#abcdef',
      }),
    ).toEqual({ primary: '#112233', accent: '#abcdef' });
  });

  test('falls back to theme tokens and then defaults', () => {
    expect(readBrandColors({ 'theme-color-action': '#010203' }).primary).toBe('#010203');
    expect(readBrandColors({}).primary).toBe('#6544e9');
    expect(readBrandColors({ 'brand-primary': 'red' }).primary).toBe('#6544e9');
  });

  test('rejects colors that are not #RRGGBB', () => {
    expect(isBrandHex('#aabbcc')).toBe(true);
    expect(isBrandHex('#abc')).toBe(false);
    expect(isBrandHex('blue')).toBe(false);
  });

  test('writes brand colors without dropping other appearance values', () => {
    const next = appearanceWithBrand({ 'theme-rounded-corners': '8px' }, '#111111', '#222222');
    expect(next['theme-rounded-corners']).toBe('8px');
    expect(next['brand-primary']).toBe('#111111');
    expect(next['brand-accent']).toBe('#222222');
    expect(next['theme-color-action']).toBe('#111111');
    expect(next['theme-color-action-hover']).toBe('#222222');
    expect(next['theme-color-components-primary-button-background']).toBe('#111111');
    expect(next['theme-color-components-video-live-indicator']).toBe('#222222');
  });
});

describe('player language pack', () => {
  test('uses Simplified Chinese strings and keeps shortcut suffixes', () => {
    const pack = playerLanguagePack(key => {
      if (key === 'Frontend.Player.Play') return '播放';
      if (key === 'Frontend.Player.Pause') return '暂停';
      return key;
    });
    expect(pack.Play).toBe('播放 (Space)');
    expect(pack.Pause).toBe('暂停 (Space)');
    expect(pack.LIVE).toBe('LIVE');
  });
});
