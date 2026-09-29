export const DEFAULT_BRAND_PRIMARY = '#6544e9';
export const DEFAULT_BRAND_ACCENT = '#2386e2';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export const isBrandHex = (value: string): boolean => HEX_COLOR.test(value.trim());

export type BrandColors = {
  primary: string;
  accent: string;
};

/** Reads the saved brand colors, falling back to the theme tokens they drive. */
export const readBrandColors = (variables: Record<string, string> | undefined): BrandColors => {
  const vars = variables || {};
  const primary = (
    vars['brand-primary'] ||
    vars['theme-color-action'] ||
    DEFAULT_BRAND_PRIMARY
  ).trim();
  const accent = (
    vars['brand-accent'] ||
    vars['theme-color-action-hover'] ||
    DEFAULT_BRAND_ACCENT
  ).trim();
  return {
    primary: isBrandHex(primary) ? primary : DEFAULT_BRAND_PRIMARY,
    accent: isBrandHex(accent) ? accent : DEFAULT_BRAND_ACCENT,
  };
};

/**
 * Merges brand colors into the appearance map the viewer already applies.
 * Primary drives links and buttons. Accent drives hover and the live dot.
 * Other saved colors are kept.
 */
export const appearanceWithBrand = (
  existing: Record<string, string> | undefined,
  primary: string,
  accent: string,
): Record<string, string> => ({
  ...(existing || {}),
  'brand-primary': primary,
  'brand-accent': accent,
  'theme-color-action': primary,
  'theme-color-action-hover': accent,
  'theme-color-components-primary-button-background': primary,
  'theme-color-components-primary-button-border': primary,
  'theme-color-components-secondary-button-border': primary,
  'theme-color-components-video-live-indicator': accent,
});
