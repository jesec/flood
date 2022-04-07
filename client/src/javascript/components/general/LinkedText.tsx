import {FC} from 'react';

interface LinkedTextProps {
  text: string;
  className?: string;
}

function isValidHttpUrl(s: string) {
  var url;

  try {
    url = new URL(s);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}

const LinkedText: FC<LinkedTextProps> = ({text, className}: LinkedTextProps) => {
  const nodes = text.split(/(?<=\s)(?!\s)(?:\b|\B)/).map((s) =>
    isValidHttpUrl(s.trimEnd()) ? (
      <a href={s.trimEnd()} target="_blank">
        {s}
      </a>
    ) : (
      s
    ),
  );

  return <span className={className}>{nodes}</span>;
};

LinkedText.defaultProps = {
  className: undefined,
};

export default LinkedText;
