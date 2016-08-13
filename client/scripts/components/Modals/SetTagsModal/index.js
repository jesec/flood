import _ from 'lodash';
import classnames from 'classnames';
import {formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import AppDispatcher from '../../../dispatcher/AppDispatcher';
import Checkbox from '../../General/FormElements/Checkbox';
import EventTypes from '../../../constants/EventTypes';
import LoadingIndicatorDots from '../../Icons/LoadingIndicatorDots';
import Modal from '../Modal';
import ModalActions from '../ModalActions';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';

const METHODS_TO_BIND = [
  'confirmSetTags',
  'handleTextboxChange',
  'onSetTagsError'
];

class SetTagsModal extends React.Component {
  constructor() {
    super();

    this.state = {
      isSettingTags: false,
      setTagsError: null,
      tags: ''
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    let selectedTorrentsTags = TorrentStore.getSelectedTorrentsTags()[0];

    if (selectedTorrentsTags && selectedTorrentsTags.length !== 0) {
      this.setState({tags: selectedTorrentsTags.join(', ')});
    }
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.CLIENT_SET_TAGS_ERROR, this.onSetTagsError);
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.CLIENT_SET_TAGS_ERROR,
      this.onSetTagsError);
  }

  onSetTagsError() {
    this.setState({isSettingTags: false});
  }

  confirmSetTags() {
    let tags = this.state.tags.split(',');

    if (tags && tags.length > 0) {
      this.setState({isSettingTags: true});
      TorrentActions.setTaxonomy(TorrentStore.getSelectedTorrents(), tags);
    }
  }

  getActions() {
    let icon = null;
    let primaryButtonText = this.props.intl.formatMessage({
      id: 'torrents.set.tags.button.set',
      defaultMessage: 'Set Tags'
    });

    if (this.state.isSettingTags) {
      icon = <LoadingIndicatorDots viewBox="0 0 32 32" />;
      primaryButtonText = this.props.intl.formatMessage({
        id: 'torrents.set.tags.button.state.setting',
        defaultMessage: 'Setting...'
      });
    }

    return [
      {
        clickHandler: null,
        content: this.props.intl.formatMessage({
          id: 'button.cancel',
          defaultMessage: 'Cancel'
        }),
        triggerDismiss: true,
        type: 'secondary'
      },
      {
        clickHandler: this.confirmSetTags,
        content: (
          <span>
            {icon}
            {primaryButtonText}
          </span>
        ),
        supplementalClassName: icon != null ? 'has-icon' : '',
        triggerDismiss: false,
        type: 'primary'
      }
    ];
  }

  handleTextboxChange(event) {
    this.setState({tags: event.target.value});
  }

  getContent() {
    return (
      <div className="form modal__content">
        <div className="form__row">
          <div className="form__column">
            <input className="textbox" type="text"
              onChange={this.handleTextboxChange} value={this.state.tags} />
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Modal actions={this.getActions()}
        content={this.getContent()}
        dismiss={this.props.dismiss}
        heading={this.props.intl.formatMessage({
          id: 'torrents.set.tags.heading',
          defaultMessage: 'Set Tags'
        })} />
    );
  }
}

export default injectIntl(SetTagsModal);
