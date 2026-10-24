import fs from 'fs';
import path from 'path';
import type { NextRouter } from 'next/router';
import type { loadViewerLocale, shouldCleanUrlAfterFlip } from '../utils/localeLoader';
import { AVAILABLE_LOCALES, pickLocale, withFallbackTranslations } from '../utils/localeLoader';

type LoadViewerLocale = typeof loadViewerLocale;
type ShouldCleanUrlAfterFlip = typeof shouldCleanUrlAfterFlip;

interface I18nShape {
  translations: Record<string, Record<string, unknown>>;
}

// loadViewerLocale has a module-level once-guard, so every test that calls it
// needs a fresh copy of the module. The loader mutates the i18n singleton it
// imported, so both modules must come out of the same isolated registry or
// the test would inspect a different object than the one being mutated.
const freshModules = (): {
  load: LoadViewerLocale;
  shouldClean: ShouldCleanUrlAfterFlip;
  i18n: I18nShape;
} => {
  let load!: LoadViewerLocale;
  let shouldClean!: ShouldCleanUrlAfterFlip;
  let i18n!: I18nShape;
  jest.isolateModules(() => {
    /* eslint-disable global-require, @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
    load = require('../utils/localeLoader').loadViewerLocale;
    shouldClean = require('../utils/localeLoader').shouldCleanUrlAfterFlip;
    i18n = require('../i18n');
    /* eslint-enable global-require, @typescript-eslint/no-var-requires */
  });
  return { load, shouldClean, i18n };
};

const setBrowserLanguage = (language: string) => {
  Object.defineProperty(window.navigator, 'languages', {
    value: [language],
    configurable: true,
  });
};

afterEach(() => {
  // Remove the instance override so the next test (or file) sees jsdom's own
  // navigator.languages again.
  Reflect.deleteProperty(window.navigator, 'languages');
});

const makeRouter = (query: Record<string, string>) => {
  const replace = jest.fn(async () => true);
  const router = { query, replace } as unknown as NextRouter;
  return { router, replace };
};

describe('pickLocale', () => {
  test.each([
    ['valid query loads that catalog', 'de', 'fr-FR', 'de'],
    ['unknown query stays on the bundled default', 'xx', 'de-DE', null],
    ['absent query ignores browser language', undefined, 'de-DE', null],
    ['malay browser stays on Simplified Chinese', undefined, 'ms-MY', null],
    ['query is exact-match only, no case folding', 'DE', 'zz-ZZ', null],
    ['english from the query needs no catalog', 'en', 'de-DE', null],
    ['english from the browser stays on the bundled default', undefined, 'en-US', null],
    ['simplified Chinese browser stays on the bundled default', undefined, 'zh-CN', null],
    ['generic zh browser stays on simplified Chinese', undefined, 'zh', null],
    ['zh-Hans browser stays on simplified Chinese', undefined, 'zh-Hans', null],
    ['traditional Chinese browser stays on simplified Chinese', undefined, 'zh-TW', null],
    ['zh-HK browser stays on simplified Chinese', undefined, 'zh-HK', null],
    ['explicit zh query is not remapped onto zh-CN', 'zh', 'zh-CN', 'zh'],
    ['explicit zh-CN query needs no fetch', 'zh-CN', 'de-DE', null],
    ['unknown query and unknown browser yield nothing', 'xx', 'zz-ZZ', null],
    ['both inputs missing yields nothing', undefined, undefined, null],
  ])('%s', (_name, queryLang, _browserLanguage, expected) => {
    expect(pickLocale(queryLang)).toBe(expected);
  });
});

describe('withFallbackTranslations', () => {
  test('fills missing and blank values without replacing translations', () => {
    expect(
      withFallbackTranslations(
        {
          translated: 'Μετάφραση',
          blank: ' ',
          nested: { empty: '' },
        },
        {
          translated: 'Translation',
          missing: 'Missing',
          blank: 'Blank',
          nested: { empty: 'Empty', missing: 'Nested missing' },
        },
      ),
    ).toEqual({
      translated: 'Μετάφραση',
      missing: 'Missing',
      blank: 'Blank',
      nested: { empty: 'Empty', missing: 'Nested missing' },
    });
  });
});

describe('AVAILABLE_LOCALES', () => {
  test('offers en and de but deliberately not eu', () => {
    expect(AVAILABLE_LOCALES).toContain('en');
    expect(AVAILABLE_LOCALES).toContain('de');
    expect(AVAILABLE_LOCALES).toContain('zh');
    expect(AVAILABLE_LOCALES).toContain('zh-CN');
    expect(AVAILABLE_LOCALES).not.toContain('eu');
  });

  test('has no duplicate entries', () => {
    expect(new Set(AVAILABLE_LOCALES).size).toBe(AVAILABLE_LOCALES.length);
  });

  test('every offered locale has a catalog file on disk', () => {
    const missing = AVAILABLE_LOCALES.filter(
      locale => !fs.existsSync(path.join(__dirname, '..', 'i18n', locale, 'translation.json')),
    );
    expect(missing).toEqual([]);
  });
});

describe('loadViewerLocale', () => {
  test('German browser without ?lang stays on Simplified Chinese', async () => {
    setBrowserLanguage('de-DE');
    const { load, i18n } = freshModules();
    const { router, replace } = makeRouter({ existing: 'param' });

    await load(router);

    expect(replace).not.toHaveBeenCalled();
    expect(Object.keys(i18n.translations)).toEqual(['en', 'zh-CN']);
  });

  test('loaded catalog retains translated values', async () => {
    setBrowserLanguage('el-GR');
    const { load, i18n } = freshModules();
    const { router } = makeRouter({ lang: 'el' });

    await load(router);

    const english = i18n.translations.en as {
      Testing: Record<string, string>;
    };
    const greek = i18n.translations.el as typeof english;
    expect(greek.Testing.simpleKey).not.toBe(english.Testing.simpleKey);
  });

  test('explicit ?lang=de bounces the query param off and back on', async () => {
    setBrowserLanguage('en-US');
    const { load, i18n } = freshModules();
    const { router, replace } = makeRouter({ lang: 'de', foo: 'bar' });

    await load(router);

    expect(i18n.translations.de).toBeDefined();
    expect(replace).toHaveBeenCalledTimes(2);
    expect(replace).toHaveBeenNthCalledWith(1, { query: { foo: 'bar' } }, undefined, {
      shallow: true,
      scroll: false,
    });
    expect(replace).toHaveBeenNthCalledWith(2, { query: { foo: 'bar', lang: 'de' } }, undefined, {
      shallow: true,
      scroll: false,
    });
  });

  test('English browser without ?lang changes nothing', async () => {
    setBrowserLanguage('en-US');
    const { load, i18n } = freshModules();
    const { router, replace } = makeRouter({});

    await load(router);

    expect(replace).not.toHaveBeenCalled();
    expect(Object.keys(i18n.translations)).toEqual(['en', 'zh-CN']);
  });

  test('second call is a no-op even with different inputs', async () => {
    setBrowserLanguage('de-DE');
    const { load, i18n } = freshModules();
    const first = makeRouter({ lang: 'de' });
    await load(first.router);
    expect(first.replace).toHaveBeenCalledTimes(2);

    // A later explicit ?lang= must not start another load: the once-guard
    // still wins, so no French catalog and no navigation.
    setBrowserLanguage('fr-FR');
    const second = makeRouter({ lang: 'fr' });
    await load(second.router);

    expect(second.replace).not.toHaveBeenCalled();
    expect(i18n.translations.fr).toBeUndefined();
  });

  test('a no-op first call does not consume the once-guard', async () => {
    // Regression guard for the PR review comment: the guard flips only when
    // a load actually starts, so an English first evaluation must leave the
    // loader available for a later call on the same module instance.
    setBrowserLanguage('en-US');
    const { load, shouldClean, i18n } = freshModules();
    const first = makeRouter({});
    await load(first.router);

    expect(first.replace).not.toHaveBeenCalled();
    expect(Object.keys(i18n.translations)).toEqual(['en', 'zh-CN']);

    // Same module instance, now with an explicit loadable ?lang=.
    setBrowserLanguage('de-DE');
    const second = makeRouter({ lang: 'de' });
    await load(second.router);

    expect(i18n.translations.de).toBeDefined();
    expect(second.replace).toHaveBeenCalledTimes(2);
    expect(shouldClean('de')).toBe(false);
  });
});

describe('shouldCleanUrlAfterFlip', () => {
  test('browser-default load does not switch language or register cleanup', async () => {
    setBrowserLanguage('de-DE');
    const { load, shouldClean } = freshModules();
    const { router, replace } = makeRouter({});

    await load(router);

    expect(replace).not.toHaveBeenCalled();
    expect(shouldClean('de')).toBe(false);
  });

  test('explicit ?lang load never registers a cleanup', async () => {
    setBrowserLanguage('en-US');
    const { load, shouldClean } = freshModules();
    const { router, replace } = makeRouter({ lang: 'de' });

    await load(router);

    expect(replace).toHaveBeenCalledTimes(2);
    expect(shouldClean('de')).toBe(false);
  });

  test('returns false before any load and after a no-op English load', async () => {
    setBrowserLanguage('en-US');
    const { load, shouldClean } = freshModules();

    expect(shouldClean('de')).toBe(false);

    const { router, replace } = makeRouter({});
    await load(router);

    expect(replace).not.toHaveBeenCalled();
    expect(shouldClean('de')).toBe(false);
    expect(shouldClean('en')).toBe(false);
  });
});
