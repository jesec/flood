// Import styles
import '../client/src/sass/style.scss';
import '../client/src/sass/panda.css';
import './storybook-layout.css'; // Ensures proper layout hierarchy in Storybook

// FloodActions is mocked via webpack alias but not used directly in preview
import {i18n} from '@lingui/core';
// Import language files with Lingui loader
import {messages as enMessages} from '@lingui/loader!../client/src/javascript/i18n/strings/en.json?raw-lingui';
import {I18nProvider} from '@lingui/react';
import type {Preview} from '@storybook/react';
import React, {useEffect} from 'react';
import {BrowserRouter} from 'react-router-dom';

// Configure i18n with proper message format
i18n.load('en', enMessages as Record<string, string[]>);
i18n.activate('en');

const preview: Preview = {
  parameters: {
    actions: {argTypesRegex: '^on[A-Z].*'},
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      disableSaveFromUI: true, // Prevents users from saving control changes as new stories
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
      },
    },
    backgrounds: {
      disable: true, // Disable Storybook's background addon since we handle it ourselves
    },
  },
  decorators: [
    (Story, context) => {
      // Check both globals.theme and parameters.theme
      const theme = context.globals?.theme || context.parameters?.theme || 'light';

      useEffect(() => {
        // Ensure proper body layout styles
        document.documentElement.style.height = '100%';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.margin = '0';
        document.body.style.padding = '0';

        // Set the background color based on theme
        if (theme === 'dark') {
          document.body.style.backgroundColor = '#121212'; // torrent-list--background dark theme
          document.body.classList.add('dark');
          document.body.classList.remove('light');
        } else {
          document.body.style.backgroundColor = '#fff'; // torrent-list--background light theme
          document.body.classList.add('light');
          document.body.classList.remove('dark');
        }
      }, [theme]);

      return (
        <BrowserRouter>
          <I18nProvider i18n={i18n}>
            <div id="app">
              <Story />
            </div>
          </I18nProvider>
        </BrowserRouter>
      );
    },
  ],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          {value: 'light', title: 'Light'},
          {value: 'dark', title: 'Dark'},
        ],
        showName: true,
      },
    },
  },
};

export default preview;
