import classnames from 'classnames';
import * as React from 'react';

import {dispatchChangeEvent} from './util/forms';
import FormRowItem from './FormRowItem';

import type {FormRowItemProps} from './FormRowItem';

export interface ToggleInputProps {
  id?: React.InputHTMLAttributes<HTMLInputElement>['name'];
  groupID?: React.InputHTMLAttributes<HTMLInputElement>['name'];
  type: 'checkbox' | 'radio';
  value?: React.InputHTMLAttributes<HTMLInputElement>['value'];
  checked?: React.InputHTMLAttributes<HTMLInputElement>['checked'];
  onChange?: (event: React.MouseEvent<HTMLInputElement> | KeyboardEvent) => void; // Actually onClick
  shrink?: FormRowItemProps['shrink'];
  grow?: FormRowItemProps['grow'];
  width?: FormRowItemProps['width'];
  icon: JSX.Element;
  matchTextboxHeight?: boolean;
  labelOffset?: boolean;
  useProps?: boolean; // Is the element controlled or not.
}

interface ToggleInputStates {
  isActive: boolean;
}

class ToggleInput extends React.Component<ToggleInputProps, ToggleInputStates> {
  inputRef: HTMLInputElement | null = null;

  static defaultProps = {
    onChange: () => {
      // do nothing.
    },
    grow: false,
    shrink: false,
  };

  constructor(props: ToggleInputProps) {
    super(props);

    this.state = {
      isActive: false,
    };
  }

  getCheckedProp(): React.InputHTMLAttributes<HTMLInputElement>['checked'] {
    const {useProps, checked} = this.props;

    // When element is controlled, we provide the checked prop.
    if (useProps) {
      return checked != null && checked;
    }
    return undefined;
  }

  getDefaultCheckedProp(): React.InputHTMLAttributes<HTMLInputElement>['defaultChecked'] {
    const {useProps, checked} = this.props;

    // When element is uncontrolled, we provide the defaultChecked prop.
    if (!useProps) {
      return checked;
    }
    return undefined;
  }

  getValueProp(): React.InputHTMLAttributes<HTMLInputElement>['value'] {
    const {type, value} = this.props;

    if (type === 'radio') {
      return value;
    }
    return undefined;
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.setState((prevState) => {
        return {isActive: !prevState.isActive};
      });
    }
  };

  handleKeyUp = (event: KeyboardEvent) => {
    if (this.inputRef == null) {
      return;
    }

    if (event.key === ' ' || event.key === 'Enter') {
      this.inputRef.checked = !this.inputRef.checked;
      // We're faking the event's target to make it easier to handle this keyboard event.
      this.handleInputClick(event);
    }

    if (this.state.isActive) {
      this.setState({isActive: false});
    }
  };

  handleLabelBlur = () => {
    if (this.state.isActive) {
      this.setState({isActive: false});
    }

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  };

  handleLabelFocus = () => {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  };

  handleInputClick = (event: React.MouseEvent<HTMLInputElement> | KeyboardEvent) => {
    if (this.inputRef != null) {
      dispatchChangeEvent(this.inputRef);
    }
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(event);
    }
  };

  render() {
    const {children, id, groupID, type, labelOffset, matchTextboxHeight, icon, width, shrink, grow} = this.props;
    const {isActive} = this.state;

    const classes = classnames('form__element toggle-input', type, {
      'toggle-input--is-active': isActive,
      'form__element--match-textbox-height': matchTextboxHeight,
      'form__element--label-offset': labelOffset,
    });

    return (
      <FormRowItem shrink={shrink} grow={grow} width={width}>
        <label className={classes} onBlur={this.handleLabelBlur} onFocus={this.handleLabelFocus}>
          <input
            defaultChecked={this.getDefaultCheckedProp()}
            checked={this.getCheckedProp()}
            className="toggle-input__element"
            name={type === 'radio' ? groupID : id}
            onClick={this.handleInputClick}
            onChange={this.handleInputChange}
            ref={(ref) => {
              this.inputRef = ref;
            }}
            type={type}
            value={this.getValueProp()}
          />
          <div className="toggle-input__indicator">
            <div className="toggle-input__indicator__icon">{icon}</div>
          </div>
          <div className="toggle-input__label">{children}</div>
        </label>
      </FormRowItem>
    );
  }
}

export default ToggleInput;
