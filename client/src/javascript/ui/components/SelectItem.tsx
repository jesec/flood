import classnames from 'classnames';
import {FC, ReactNode} from 'react';

import {Checkmark} from '@client/ui/icons';

import ContextMenuItem from './ContextMenuItem';

export interface SelectItemProps {
  children: ReactNode;
  id: string | number;
  isPlaceholder?: boolean;
  isSelected?: boolean;
  isTrigger?: boolean;
  onClick?: (id: this['id']) => void;
}

const SelectItem: FC<SelectItemProps> = ({
  children,
  id,
  isPlaceholder = false,
  isTrigger = false,
  isSelected = false,
  onClick,
}: SelectItemProps) => {
  let icon = null;
  if (!isTrigger && isSelected) {
    icon = <Checkmark />;
  }

  const classes = classnames({
    'select__item context-menu__item': !isTrigger,
    'select__item--is-placeholder': isPlaceholder,
    'select__item--is-selected': isSelected,
  });

  return (
    <ContextMenuItem className={classes} onClick={() => onClick?.(id)}>
      {icon}
      {children}
    </ContextMenuItem>
  );
};

export default SelectItem;
