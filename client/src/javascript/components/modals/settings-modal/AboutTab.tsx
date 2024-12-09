import {FC, Suspense} from 'react';

import Markdown from 'react-markdown';

import packageJSON from '../../../../../../package.json';

import AboutMarkdown from '../../../../ABOUT.md';

const FLOOD_PROJECT_URL = 'https://github.com/jesec/flood';

const versioned = AboutMarkdown.replaceAll('<FloodVersion />', packageJSON.version).replaceAll(
  '<CommitBadge />',
  packageJSON.version.length > 8
    ? // If user is on a rolling build, display latest version of rolling build.
      `![${FLOOD_PROJECT_URL}]("https://img.shields.io/npm/v/@jesec/flood?label=HEAD" "Latest version of rolling build")`
    : // If user is on a released build, display commits to project made since user's version.
      `![${FLOOD_PROJECT_URL}](https://img.shields.io/github/commits-since/jesec/flood/v${packageJSON.version} "Commits since user's version")`,
);

const AboutTab: FC = () => (
  <Suspense fallback={null}>
    <Markdown>{versioned}</Markdown>
  </Suspense>
);

export default AboutTab;
