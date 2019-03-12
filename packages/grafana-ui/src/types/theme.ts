export enum GrafanaThemeType {
  Light = 'light',
  Dark = 'dark',
}

export interface GrafanaThemeCommons {
  name: string;
  // TODO: not sure if should be a part of theme
  breakpoints: {
    xs: string;
    s: string;
    m: string;
    l: string;
    xl: string;
  };
  typography: {
    fontFamily: {
      sansSerif: string;
      monospace: string;
    };
    size: {
      root: string;
      base: string;
      xs: string;
      s: string;
      m: string;
      l: string;
    };
    weight: {
      light: number;
      normal: number;
      semibold: number;
    };
    lineHeight: {
      xs: number; //1
      s: number; //1.1
      m: number; // 4/3
      l: number; // 1.5
    };
    // TODO: Refactor to use size instead of custom defs
    heading: {
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      h5: string;
      h6: string;
    };
  };
  spacing: {
    xs: string;
    s: string;
    m: string;
    l: string;
    gutter: string;
  };
  border: {
    radius: {
      xs: string;
      s: string;
      m: string;
    };
    width: {
      s: string;
    };
  };
}

export interface GrafanaTheme extends GrafanaThemeCommons {
  type: GrafanaThemeType;
  background: {
    dropdown: string;
    scrollbar: string;
    scrollbar2: string;
  };
  colors: {
    black: string;
    white: string;
    dark1: string;
    dark2: string;
    dark3: string;
    dark4: string;
    dark5: string;
    dark6: string;
    dark7: string;
    dark8: string;
    dark9: string;
    dark10: string;
    gray1: string;
    gray2: string;
    gray3: string;
    gray4: string;
    gray5: string;
    gray6: string;
    gray7: string;
    grayBlue: string;
    inputBlack: string;

    // Accent colors
    blue: string;
    blueBase: string;
    blueShade: string;
    blueLight: string;
    blueFaint: string;
    redBase: string;
    redShade: string;
    greenBase: string;
    greenShade: string;
    red: string;
    yellow: string;
    purple: string;
    variable: string;
    orange: string;
    queryRed: string;
    queryGreen: string;
    queryPurple: string;
    queryKeyword: string;
    queryOrange: string;
    brandPrimary: string;
    brandSuccess: string;
    brandWarning: string;
    brandDanger: string;

    // Status colors
    online: string;
    warn: string;
    critical: string;

    // Link colors
    link: string;
    linkDisabled: string;
    linkHover: string;
    linkExternal: string;

    // Text colors
    body: string;
    text: string;
    textStrong: string;
    textWeak: string;
    textFaint: string;
    textEmphasis: string;

    // TODO: move to background section
    bodyBg: string;
    pageBg: string;
    headingColor: string;
  };
}

export interface Themeable {
  theme: GrafanaTheme;
}
