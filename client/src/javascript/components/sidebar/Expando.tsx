import {FC, KeyboardEvent, MouseEvent, ReactNode, TouchEvent} from 'react';
import {Chevron} from '@client/ui/icons';

interface ExpandoProps {
  children: ReactNode;
  expanded: boolean;
  handleClick: (event: KeyboardEvent | MouseEvent | TouchEvent) => void;
}

const Expando: FC<ExpandoProps> = ({children, expanded, handleClick}: ExpandoProps) => (
  <button className="expando" onClick={(event) => handleClick(event)} css={{textTransform: "inherit", display:"flex", alignItems: "center"}}>
    {children}
    {expanded ? <Chevron css={{transform:"scaleY(-1)"}} /> : <Chevron />}
  </button>
);

export default Expando;
