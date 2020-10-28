import {Component} from 'react';
import {defineMessages, injectIntl, WrappedComponentProps} from 'react-intl';

import SettingsIcon from '../icons/SettingsIcon';
import Tooltip from '../general/Tooltip';
import UIActions from '../../actions/UIActions';

const MESSAGES = defineMessages({
  settings: {
    id: 'sidebar.button.settings',
  },
});

class SettingsButton extends Component<WrappedComponentProps> {
  tooltipRef: Tooltip | null = null;

  constructor(props: WrappedComponentProps) {
    super(props);

    this.handleSettingsButtonClick = this.handleSettingsButtonClick.bind(this);
  }

  handleSettingsButtonClick() {
    if (this.tooltipRef != null) {
      this.tooltipRef.dismissTooltip();
    }

    UIActions.displayModal({id: 'settings'});
  }

  render() {
    const label = this.props.intl.formatMessage(MESSAGES.settings);

    return (
      <Tooltip
        content={label}
        onClick={this.handleSettingsButtonClick}
        ref={(ref) => {
          this.tooltipRef = ref;
        }}
        position="bottom"
        wrapperClassName="sidebar__action sidebar__icon-button
          sidebar__icon-button--interactive tooltip__wrapper">
        <SettingsIcon />
      </Tooltip>
    );
  }
}

export default injectIntl(SettingsButton);
