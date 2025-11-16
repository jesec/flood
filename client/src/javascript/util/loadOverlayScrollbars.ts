/**
 * Loads OverlayScrollbars CSS into the third-party layer
 *
 * This workaround is necessary due to a known css-loader bug:
 * https://github.com/webpack-contrib/css-loader/issues/1532
 *
 * The issue: css-loader ignores @layer definitions when @import statements
 * appear later in the same file. Wrapping an @import with @layer like:
 *   @layer third-party { @import 'overlayscrollbars/overlayscrollbars.css'; }
 * does NOT work - the CSS either doesn't load or loads without the layer.
 *
 * Our solution: Use raw-loader to import the CSS as text, then manually
 * inject it into the DOM wrapped in the correct @layer.
 */

// @ts-expect-error - webpack loader syntax not recognized by TypeScript
import overlayScrollbarsCSS from '!raw-loader!overlayscrollbars/styles/overlayscrollbars.css';

// Only inject if we successfully loaded the CSS
if (typeof overlayScrollbarsCSS === 'string' && typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = `@layer third-party { ${overlayScrollbarsCSS} }`;
  styleElement.setAttribute('data-layer', 'third-party');
  document.head.appendChild(styleElement);
}
