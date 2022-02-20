import {FC, KeyboardEvent, MouseEvent, ReactNode, TouchEvent} from 'react';
import {Chevron} from '@client/ui/icons';

interface ExpandoProps {
  children: ReactNode;
  className?: string;
  expanded: boolean;
  handleClick: (event: KeyboardEvent | MouseEvent | TouchEvent) => void;
}

const Expando: FC<ExpandoProps> = ({children, className, expanded, handleClick}: ExpandoProps) => (
  <button className={className} onClick={(event) => handleClick(event)}>
    {children}
    {expanded ? <Chevron css={{transform: 'scaleY(-1)'}} /> : <Chevron />}
  </button>
);

Expando.defaultProps = {
  className: undefined,
};

export default Expando;
