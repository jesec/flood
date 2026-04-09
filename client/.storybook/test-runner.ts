/**
 * Storybook Test Runner Configuration
 * Captures computed CSS styles during test runs for SASS module migration validation
 */

import fs from 'node:fs';
import path from 'node:path';

import type {TestRunnerConfig} from '@storybook/test-runner';

// CSS properties to capture for migration validation
const CSS_PROPERTIES_TO_CAPTURE = [
  // Layout
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'box-sizing',
  'overflow',
  'overflow-x',
  'overflow-y',
  'z-index',

  // Flexbox
  'flex',
  'flex-direction',
  'flex-wrap',
  'justify-content',
  'align-items',
  'align-self',
  'gap',
  'column-gap',
  'row-gap',

  // Typography
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-decoration',
  'text-transform',
  'white-space',
  'word-break',

  // Visual
  'color',
  'background',
  'background-color',
  'background-image',
  'background-position',
  'background-size',
  'background-repeat',
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-radius',
  'border-color',
  'border-width',
  'border-style',
  'box-shadow',
  'opacity',
  'visibility',

  // Transitions/Animations
  'transition',
  'transform',
  'animation',

  // Other
  'cursor',
  'pointer-events',
  'user-select',

  // Grid (for future components)
  'grid-template-columns',
  'grid-template-rows',
  'grid-gap',
  'grid-column',
  'grid-row',
  'place-items',

  // Additional Flexbox
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'order',

  // Text Details
  'text-overflow',
  'text-indent',
  'vertical-align',
  'word-spacing',
  'text-shadow',

  // SVG Properties (for icons)
  'fill',
  'stroke',
  'stroke-width',

  // Modern CSS
  'filter',
  'backdrop-filter',
  'clip-path',
  'outline',
  'outline-offset',

  // Table (if used)
  'border-collapse',
  'border-spacing',

  // List
  'list-style',
  'list-style-type',
];

const config: TestRunnerConfig = {
  async postVisit(page, context) {
    // Only capture CSS for TorrentListRow stories
    if (!context.id.includes('torrentlistrow')) {
      return;
    }

    // Performance guard - skip if too many elements
    const elementCount = await page.evaluate(() => document.querySelectorAll('*').length);
    if (elementCount > 1000) {
      console.warn(`⚠️ Skipping CSS capture for ${context.id}: Too many elements (${elementCount})`);
      return;
    }

    // Wait for React to render (with timeout)
    await page.waitForTimeout(500);

    // Extract computed styles
    const storyId = context.id;
    const computedStyles = await page.evaluate(
      ([properties, id]) => {
        const results: Record<string, any> = {};

        // Helper to get unique selector for element
        const getSelector = (element: Element) => {
          const classes = Array.from(element.classList).join('.');
          const tag = element.tagName.toLowerCase();
          return classes ? `${tag}.${classes}` : tag;
        };

        // Find the torrent row element
        const torrentRow = document.querySelector('.torrent');
        if (!torrentRow) {
          return {error: 'No torrent row found'};
        }

        // Capture main torrent row styles
        const torrentStyles = window.getComputedStyle(torrentRow);
        const torrentSelector = getSelector(torrentRow);
        results[torrentSelector] = {};

        const propsArray = Array.isArray(properties) ? properties : [properties];
        propsArray.forEach((prop: string) => {
          const value = torrentStyles.getPropertyValue(prop);
          if (value && value !== 'none' && value !== 'auto' && value !== 'initial') {
            results[torrentSelector][prop] = value;
          }
        });

        // Capture all child elements' styles
        const children = torrentRow.querySelectorAll('*');
        children.forEach((child) => {
          const childStyles = window.getComputedStyle(child);
          const childSelector = getSelector(child);

          // Skip if no relevant styles
          const propsArray = Array.isArray(properties) ? properties : [properties];
          const hasRelevantStyles = propsArray.some((prop: string) => {
            const value = childStyles.getPropertyValue(prop);
            return value && value !== 'none' && value !== 'auto' && value !== 'initial';
          });

          if (hasRelevantStyles) {
            results[childSelector] = {};
            const propsArray = Array.isArray(properties) ? properties : [properties];
            propsArray.forEach((prop: string) => {
              const value = childStyles.getPropertyValue(prop);
              if (value && value !== 'none' && value !== 'auto' && value !== 'initial') {
                results[childSelector][prop] = value;
              }
            });
          }
        });

        // Include metadata
        return {
          storyId: id,
          timestamp: new Date().toISOString(),
          classes: Array.from(torrentRow.classList),
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          styles: results,
        };
      },
      [CSS_PROPERTIES_TO_CAPTURE, storyId],
    );

    // Save computed styles to file for comparison
    const outputDir = path.join(__dirname, '../css-snapshots/baseline');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {recursive: true});
    }

    const outputFile = path.join(outputDir, `${context.id.replace(/[^a-z0-9]/gi, '-')}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(computedStyles, null, 2));

    // Log summary
    console.log(`✅ Captured CSS for ${context.title}:`);
    console.log(`   Classes: ${computedStyles.classes?.join(', ')}`);
    console.log(`   Elements styled: ${Object.keys(computedStyles.styles || {}).length}`);
    console.log(`   Saved to: ${outputFile}`);
  },
};

export default config;
