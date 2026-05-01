/**
 * Loads OverlayScrollbars CSS into the third-party layer
 *
 * This workaround manually injects OverlayScrollbars CSS into a @layer
 * to ensure proper CSS cascade ordering.
 */

import overlayScrollbarsCSS from 'overlayscrollbars/styles/overlayscrollbars.css?raw';

// Only inject if we successfully loaded the CSS
if (typeof overlayScrollbarsCSS === 'string' && typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = `@layer third-party { ${overlayScrollbarsCSS} }`;
  styleElement.setAttribute('data-layer', 'third-party');
  document.head.appendChild(styleElement);
}
