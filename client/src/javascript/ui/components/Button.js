import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import FadeIn from './FadeIn';
import FormElementAddon from './FormElementAddon';
import FormRowItem from './FormRowItem';
import LoadingRing from '../icons/LoadingRing';

export default class Button extends Component {
  static propTypes = {
    addonPlacement: PropTypes.oneOf(['before', 'after']),
    grow: PropTypes.bool,
    priority: PropTypes.oneOf(['primary', 'secondary', 'tertiary', 'quaternary']),
    shrink: PropTypes.bool,
    type: PropTypes.oneOf(['submit', 'reset', 'button']),
  };

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
    return React.Children.toArray(this.props.children).some((child) => child.type === FormElementAddon);
  }

  getButtonContent() {
    const buttonContent = React.Children.toArray(this.props.children).reduce(
      (accumulator, child) => {
        if (child.type === FormElementAddon) {
          accumulator.addonNodes.push(
            React.cloneElement(child, {
              addonPlacement: this.props.addonPlacement,
              key: child.props.className,
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
      return (
        <this.props.wrapper
          {...{
            shrink: this.props.shrink,
            grow: this.props.grow,
            ...this.props.wrapperProps,
          }}>
          {content}
        </this.props.wrapper>
      );
    }

    return content;
  }
}
