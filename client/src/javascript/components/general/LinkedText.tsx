import {FC} from 'react';

interface LinkedTextProps {
  text: string;
  className?: string;
}

function isValidHttpUrl(s: string) {
  let url;

  try {
    url = new URL(s);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}

const LinkedText: FC<LinkedTextProps> = ({text, className}: LinkedTextProps) => {
  const nodes = text.split(/([ \n])/).map((s, index) => {
    if (s === '\n') {
      return <br key={index} />;
    }
    if (isValidHttpUrl(s)) {
      return (
        <a href={s.trimEnd()} target="_blank" rel="noopener noreferrer" key={index}>
          {s}
        </a>
      );
    }
    return s;
  });

  return <span className={className}>{nodes}</span>;
};

LinkedText.defaultProps = {
  className: undefined,
};

export default LinkedText;
