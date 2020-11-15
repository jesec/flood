import classnames from 'classnames';
import * as React from 'react';

import FadeIn from './FadeIn';
import FormElementAddon from './FormElementAddon';
import FormRowItem from './FormRowItem';
import LoadingRing from '../icons/LoadingRing';

export type ButtonProps = Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'onClick' | 'onChange'> & {
  buttonRef?: React.Ref<HTMLButtonElement>;
  isLoading?: boolean;
  additionalClassNames?: string;
  labelOffset?: boolean;
  addonPlacement?: 'before' | 'after';
  priority?: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
  type?: 'submit' | 'button';

  wrap?: boolean;
  wrapper?: string | React.FunctionComponent;
  wrapperProps?: Record<string, unknown>;
  grow?: boolean;
  shrink?: boolean;
};

export default class Button extends React.Component<ButtonProps> {
  static defaultProps = {
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

  getButtonContent() {
    const {children, addonPlacement} = this.props;
    const buttonContent = React.Children.toArray(children).reduce(
      (
        accumulator: {
          addonNodes: Array<React.ReactNode>;
          childNodes: Array<React.ReactNode>;
        },
        child,
      ) => {
        const childAsElement = child as React.ReactElement;
        if (childAsElement.type === FormElementAddon) {
          accumulator.addonNodes.push(
            React.cloneElement(childAsElement, {
              addonPlacement,
              key: childAsElement.props.className,
            }),
          );
        } else {
          accumulator.childNodes.push(child);
        }

        return accumulator;
      },
      {
        addonNodes: [],
        childNodes: [],
      },
    );

    return {
      childNode: (
        <div className="button__content" key="button-content">
          {buttonContent.childNodes}
        </div>
      ),
      addonNodes: buttonContent.addonNodes,
    };
  }

  doesButtonContainIcon() {
    const {children} = this.props;
    return React.Children.toArray(children).some((child) => {
      const childAsElement = child as React.ReactElement;
      return childAsElement.type === FormElementAddon;
    });
  }

  render() {
    const {
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
    } = this.props;
    const classes = classnames('button form__element', additionalClassNames, {
      'form__element--label-offset': labelOffset,
      'form__element--has-addon': addonPlacement,
      [`form__element--has-addon--placed-${addonPlacement}`]: addonPlacement,
      [`button--${priority}`]: priority,
      'button--is-loading': isLoading,
      'button--is-disabled': disabled,
    });
    const {addonNodes, childNode} = this.getButtonContent();

    const content = (
      <div className="form__element__wrapper">
        <button
          className={classes}
          disabled={disabled}
          onClick={onClick}
          ref={buttonRef}
          type={type === 'submit' ? 'submit' : 'button'}>
          {childNode}
          <FadeIn isIn={isLoading}>
            <LoadingRing />
          </FadeIn>
        </button>
        {addonNodes}
      </div>
    );

    if (wrap) {
      const WrapperComponent = wrapper as React.FunctionComponent;
      return (
        <WrapperComponent
          {...{
            shrink,
            grow,
            ...wrapperProps,
          }}>
          {content}
        </WrapperComponent>
      );
    }

    return content;
  }
}
