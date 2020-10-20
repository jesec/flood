import React from 'react';

const AboutMarkdown = React.lazy(() =>
  import('../../../../../../ABOUT.md').then((module) => ({default: module.react})),
);

const AboutTab = () => {
  return (
    <React.Suspense fallback={null}>
      <AboutMarkdown />
    </React.Suspense>
  );
};

export default AboutTab;
