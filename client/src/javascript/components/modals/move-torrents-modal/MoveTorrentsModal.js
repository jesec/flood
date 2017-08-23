import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import Checkbox from '../../general/form-elements/Checkbox';
import EventTypes from '../../../constants/EventTypes';
import LoadingIndicatorDots from '../../icons/LoadingIndicatorDots';
import Modal from '../Modal';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentDestination from '../../general/filesystem/TorrentDestination';
import TorrentStore from '../../../stores/TorrentStore';

const METHODS_TO_BIND = [
  'confirmMoveTorrents',
  'handleCheckboxChange',
  'onMoveError'
];

class MoveTorrents extends React.Component {
  constructor() {
    super();

    this.state = {
      moveTorrentsError: null,
      isExpanded: false,
      isSettingDownloadPath: false,
      moveTorrents: false,
      originalSource: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    let filenames = TorrentStore.getSelectedTorrentsFilename();
    let sources = TorrentStore.getSelectedTorrentsDownloadLocations();

    if (sources.length === 1) {
      let originalSource = this.removeTrailingFilename(sources[0], filenames[0]);
      this.setState({originalSource});
    }
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.CLIENT_MOVE_TORRENTS_REQUEST_ERROR, this.onMoveError);
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.CLIENT_MOVE_TORRENTS_REQUEST_ERROR, this.onMoveError);
  }

  onMoveError() {
    this.setState({isSettingDownloadPath: false});
  }

  confirmMoveTorrents() {
    let filenames = TorrentStore.getSelectedTorrentsFilename();
    let sources = TorrentStore.getSelectedTorrentsDownloadLocations();

    if (sources.length) {
      this.setState({isSettingDownloadPath: true});
      TorrentActions.moveTorrents(TorrentStore.getSelectedTorrents(), {
        destination: this.torrentDestinationRef.getWrappedInstance().getDestination(),
        isBasePath: this.torrentDestinationRef.getWrappedInstance().isBasePath(),
        filenames,
        moveFiles: this.state.moveTorrents,
        sources
      });
    }
  }

  getActions() {
    let icon = null;
    let primaryButtonText = this.props.intl.formatMessage({
      id: 'torrents.move.button.set.location',
      defaultMessage: 'Set Location'
    });

    if (this.state.isSettingDownloadPath) {
      icon = <LoadingIndicatorDots viewBox="0 0 32 32" />;
      primaryButtonText = this.props.intl.formatMessage({
        id: 'torrents.move.button.state.setting',
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
        clickHandler: this.confirmMoveTorrents,
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

  handleCheckboxChange(checkboxState) {
    this.setState({moveTorrents: checkboxState});
  }

  getContent() {
    return (
      <div className="form modal__content">
        <div className="form__row">
          <div className="form__column">
            <label className="form__label">
              <FormattedMessage
                id="torrents.add.destination.label"
                defaultMessage="Destination"
              />
            </label>
            <TorrentDestination ref={ref => this.torrentDestinationRef = ref}
              suggested={this.state.originalSource} />
          </div>
        </div>
        <div className="form__row">
          <div className="form__column">
            <Checkbox onChange={this.handleCheckboxChange}><FormattedMessage
              id="torrents.move.data.label"
              defaultMessage="Move data"
            /></Checkbox>
          </div>
        </div>
      </div>
    );
  }

  removeTrailingFilename(path, filename) {
    let directoryPath = path.substring(0, path.length - filename.length);

    if (directoryPath.charAt(directoryPath.length - 1) === '/' || directoryPath.charAt(directoryPath.length - 1) === '\\') {
      directoryPath = directoryPath.substring(0, directoryPath.length - 1);
    }

    return directoryPath;
  }

  render() {
    return (
      <Modal actions={this.getActions()}
        content={this.getContent()}
        dismiss={this.props.dismiss}
        heading={this.props.intl.formatMessage({
          id: 'torrents.move.heading',
          defaultMessage: 'Set Torrent Location'
        })} />
    );
  }
}

export default injectIntl(MoveTorrents);
