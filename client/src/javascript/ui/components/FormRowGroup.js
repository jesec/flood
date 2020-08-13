import React, {PureComponent} from 'react';

class FormRowGroup extends PureComponent {
  render() {
    return <div className="form__row form__row--group">{this.props.children}</div>;
  }
}

export default FormRowGroup;
