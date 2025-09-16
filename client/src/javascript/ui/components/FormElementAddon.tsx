import classnames from 'classnames';
import {FC, ReactNode} from 'react';

import {css} from '@client/styled-system/css';

interface FormElementAddonProps {
  children: ReactNode;
  addonPlacement?: 'before' | 'after';
  addonIndex?: number;
  className?: string;
  isInteractive?: boolean;
  type?: 'icon';
  onClick?: () => void;
}

const FormElementAddon: FC<FormElementAddonProps> = ({
  children,
  type = 'icon',
  addonPlacement,
  addonIndex,
  className,
  isInteractive = false,
  onClick,
}: FormElementAddonProps) => {
  const classes = classnames(
    'form__element__addon',
    {
      [`form__element__addon--placed-${addonPlacement}`]: addonPlacement,
      [`form__element__addon--index-${addonIndex}`]: addonIndex,
      'form__element__addon--is-interactive': isInteractive || onClick,
      'form__element__addon--is-icon': type === 'icon',
    },
    className,
  );

  return (
    <div
      className={`${classes} ${css({
        _focus: {
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
        },
      })}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyPress={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {children}
    </div>
  );
};

export default FormElementAddon;
