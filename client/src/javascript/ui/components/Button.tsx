import {ButtonHTMLAttributes, Children, cloneElement, FC, ReactElement, ReactNode, Ref} from 'react';
import classnames from 'classnames';

import {LoadingRing} from '@client/ui/icons';

import FadeIn from './FadeIn';
import FormElementAddon from './FormElementAddon';
import FormRowItem from './FormRowItem';

export type ButtonProps = Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'onClick' | 'onChange'> & {
  children: ReactNode;

  buttonRef?: Ref<HTMLButtonElement>;
  isLoading?: boolean;
  additionalClassNames?: string;
  labelOffset?: boolean;
  addonPlacement?: 'before' | 'after';
  priority?: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
  type?: 'submit' | 'button';

  wrap?: boolean;
  wrapper?: string | FC;
  wrapperProps?: Record<string, unknown>;
  grow?: boolean;
  shrink?: boolean;
};

const Button: FC<ButtonProps> = ({
  children,
  type,
  additionalClassNames,
  buttonRef,
  labelOffset,
  addonPlacement,
  priority,
  isLoading,
  disabled,
  wrap,
  wrapper,
  wrapperProps,
  shrink,
  grow,
  onClick,
}: ButtonProps) => {
  const addonNodes: Array<ReactElement> = [];
  const childNodes: Array<ReactElement> = [];

  Children.toArray(children).forEach((child) => {
    const childAsElement = child as ReactElement;

    if (childAsElement.type === FormElementAddon) {
      addonNodes.push(
        cloneElement(childAsElement, {
          addonPlacement,
          key: childAsElement.props.className,
        }),
      );
    } else {
      childNodes.push(childAsElement);
    }
  });

  const content = (
    <div className="form__element__wrapper">
      <button
        className={classnames('button form__element', additionalClassNames, {
          'form__element--label-offset': labelOffset,
          'form__element--has-addon': addonPlacement,
          [`form__element--has-addon--placed-${addonPlacement}`]: addonPlacement,
          [`button--${priority}`]: priority,
          'button--is-loading': isLoading,
          'button--is-disabled': disabled,
        })}
        disabled={disabled}
        onClick={onClick}
        ref={buttonRef}
        type={type === 'submit' ? 'submit' : 'button'}
      >
        <div className="button__content" key="button-content">
          {childNodes}
        </div>
        <FadeIn isIn={isLoading}>
          <LoadingRing />
        </FadeIn>
      </button>
      {addonNodes}
    </div>
  );

  if (wrap) {
    const WrapperComponent = wrapper as FC<{children?: React.ReactNode}>;
    return (
      <WrapperComponent
        {...{
          shrink,
          grow,
          ...wrapperProps,
        }}
      >
        {content}
      </WrapperComponent>
    );
  }

  return content;
};

Button.defaultProps = {
  additionalClassNames: '',
  disabled: false,
  grow: false,
  labelOffset: false,
  priority: 'primary',
  shrink: false,
  type: 'button',
  wrap: true,
  wrapper: FormRowItem,
  wrapperProps: {width: 'auto'},
};

export default Button;
