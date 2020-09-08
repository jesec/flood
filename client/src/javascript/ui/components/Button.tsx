import classnames from 'classnames';
import React, {Component} from 'react';

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
  type?: 'submit' | 'reset' | 'button';

  wrap?: boolean;
  wrapper?: string | React.FunctionComponent;
  wrapperProps?: object;
  grow?: boolean;
  shrink?: boolean;
};

export default class Button extends Component<ButtonProps> {
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

  doesButtonContainIcon() {
    return React.Children.toArray(this.props.children).some((child) => {
      const childAsElement = child as React.ReactElement;
      return childAsElement.type === FormElementAddon;
    });
  }

  getButtonContent() {
    const buttonContent = React.Children.toArray(this.props.children).reduce(
      (accumulator: {addonNodes: Array<React.ReactNode>; childNodes: Array<React.ReactNode>}, child) => {
        const childAsElement = child as React.ReactElement;
        if (childAsElement.type === FormElementAddon) {
          accumulator.addonNodes.push(
            React.cloneElement(childAsElement, {
              addonPlacement: this.props.addonPlacement,
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

  render() {
    const classes = classnames('button form__element', this.props.additionalClassNames, {
      'form__element--label-offset': this.props.labelOffset,
      'form__element--has-addon': this.props.addonPlacement,
      [`form__element--has-addon--placed-${this.props.addonPlacement}`]: this.props.addonPlacement,
      [`button--${this.props.priority}`]: this.props.priority,
      'button--is-loading': this.props.isLoading,
      'button--is-disabled': this.props.disabled,
    });
    const {addonNodes, childNode} = this.getButtonContent();

    const content = (
      <div className="form__element__wrapper">
        <button
          className={classes}
          disabled={this.props.disabled}
          onClick={this.props.onClick}
          ref={this.props.buttonRef}
          type={this.props.type}>
          {childNode}
          <FadeIn in={this.props.isLoading}>
            <LoadingRing />
          </FadeIn>
        </button>
        {addonNodes}
      </div>
    );

    if (this.props.wrap) {
      const WrapperComponent = this.props.wrapper as React.FunctionComponent;
      return (
        <WrapperComponent
          {...{
            shrink: this.props.shrink,
            grow: this.props.grow,
            ...this.props.wrapperProps,
          }}>
          {content}
        </WrapperComponent>
      );
    }

    return content;
  }
}
