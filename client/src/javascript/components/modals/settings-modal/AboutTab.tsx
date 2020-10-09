import axios from 'axios';
import React from 'react';

import AboutMarkdownPath from '../../../../../../ABOUT.md';

const ReactMarkdown = React.lazy(() => import('react-markdown'));

let cachedContent: string;

const AboutTab = () => {
  const [content, setContent] = React.useState(cachedContent);

  if (content == null) {
    axios.get(AboutMarkdownPath).then((response) => {
      cachedContent = response.data;
      setContent(cachedContent);
    });
  }

  return (
    <React.Suspense fallback={null}>
      <ReactMarkdown source={content} />
    </React.Suspense>
  );
};

export default AboutTab;
