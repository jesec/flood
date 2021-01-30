import {FC, lazy, Suspense} from 'react';

import packageJSON from '../../../../../../package.json';

const AboutMarkdown = lazy(() =>
  import(/* webpackChunkName: 'about' */ '../../../../ABOUT.md').then((module) => ({default: module.react})),
);

const FLOOD_PROJECT_URL = 'https://github.com/jesec/flood';

const AboutTab: FC = () => (
  <Suspense fallback={null}>
    <AboutMarkdown
      FloodVersion={() => packageJSON.version}
      CommitBadge={() =>
        packageJSON.version.length > 8 ? (
          // If user is on a rolling build, display latest version of rolling build.
          <a href={FLOOD_PROJECT_URL}>
            <img alt="Latest version of rolling build" src="https://img.shields.io/npm/v/@jesec/flood?label=HEAD" />
          </a>
        ) : (
          // If user is on a released build, display commits to project made since user's version.
          <a href={FLOOD_PROJECT_URL}>
            <img
              alt="Commits since user's version"
              src={`https://img.shields.io/github/commits-since/jesec/flood/v${packageJSON.version}`}
            />
          </a>
        )
      }
    />
  </Suspense>
);

export default AboutTab;
