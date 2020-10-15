import classnames from 'classnames';
import React from 'react';

interface FormElementAddonProps {
  children: React.ReactNode;
  addonPlacement?: 'before' | 'after';
  addonIndex?: number;
  className?: string;
  isInteractive?: boolean;
  type?: 'icon';
  onClick?: React.HTMLAttributes<HTMLDivElement>['onClick'];
}

const FormElementAddon: React.FC<FormElementAddonProps> = ({
  children,
  type,
  addonPlacement,
  addonIndex,
  className,
  isInteractive,
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
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

FormElementAddon.defaultProps = {
  type: 'icon',
  isInteractive: false,
  addonPlacement: undefined,
  addonIndex: undefined,
  className: undefined,
  onClick: undefined,
};

export default FormElementAddon;
