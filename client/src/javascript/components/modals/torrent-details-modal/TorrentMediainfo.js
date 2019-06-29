import {Button} from 'flood-ui-kit';
import Clipboard from 'clipboard';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import ClipboardIcon from '../../icons/ClipboardIcon';
import connectStores from '../../../util/connectStores';
import EventTypes from '../../../constants/EventTypes';
import FloodActions from '../../../actions/FloodActions';
import Tooltip from '../../general/Tooltip';
import TorrentStore from '../../../stores/TorrentStore';

const MESSAGES = defineMessages({
  copy: {
    id: 'general.clipboard.copy',
    defaultMessage: 'Copy',
  },
  copied: {
    id: 'general.clipboard.copied',
    defaultMessage: 'Copied',
  },
  execError: {
    id: 'mediainfo.execError',
    defaultMessage:
      'An error occurred while running mediainfo on the server. Check that mediainfo is installed and available in the PATH to Flood.',
  },
  fetching: {
    id: 'mediainfo.fetching',
    defaultMessage: 'Fetching...',
  },
  heading: {
    id: 'mediainfo.heading',
    defaultMessage: 'Mediainfo Output',
  },
});

class TorrentMediainfo extends React.Component {
  clipboard = null;

  timeoutId = null;

  state = {
    copiedToClipboard: false,
    isFetchingMediainfo: true,
    fetchMediainfoError: null,
  };

  componentDidMount() {
    FloodActions.fetchMediainfo({hash: this.props.hash}).then(
      () => {
        this.setState({
          isFetchingMediainfo: false,
          fetchMediainfoError: null,
        });
      },
      error => {
        this.setState({
          isFetchingMediainfo: false,
          fetchMediainfoError: error,
        });
      },
    );
  }

  componentDidUpdate() {
    if (this.copyButtonRef && this.clipboard == null) {
      this.clipboard = new Clipboard(this.copyButtonRef, {
        text: () => this.props.mediainfo,
      });

      this.clipboard.on('success', this.handleCopySuccess);
    }
  }

  componentWillUnmount() {
    if (this.timeoutId != null) {
      global.clearTimeout(this.timeoutId);
    }
  }

  handleCopyButtonMouseLeave = () => {
    this.timeoutId = global.setTimeout(() => {
      this.setState({
        copiedToClipboard: false,
      });
    }, 500);
  };

  handleCopySuccess = () => {
    this.setState({
      copiedToClipboard: true,
    });
  };

  render() {
    if (this.state.isFetchingMediainfo) {
      return (
        <div className="torrent-details__section mediainfo">
          <FormattedMessage id={MESSAGES.fetching.id} defaultMessage={MESSAGES.fetching.defaultMessage} />
        </div>
      );
    }

    if (this.state.fetchMediainfoError) {
      const errorData = this.state.fetchMediainfoError.data || {};

      return (
        <div className="torrent-details__section mediainfo">
          <p>
            <FormattedMessage id={MESSAGES.execError.id} defaultMessage={MESSAGES.execError.defaultMessage} />
          </p>
          <pre className="mediainfo__output mediainfo__output--error">{JSON.stringify(errorData.error, null, 2)}</pre>
        </div>
      );
    }

    let tooltipText = this.props.intl.formatMessage(MESSAGES.copy);

    if (this.state.copiedToClipboard) {
      tooltipText = this.props.intl.formatMessage(MESSAGES.copied);
    }

    return (
      <div className="torrent-details__section mediainfo">
        <div className="mediainfo__toolbar">
          <div className="mediainfo__toolbar__item">
            <span className="torrent-details__table__heading--tertiary">
              <FormattedMessage id={MESSAGES.heading.id} defaultMessage={MESSAGES.heading.defaultMessage} />
            </span>
          </div>
          <Tooltip
            content={tooltipText}
            onMouseLeave={this.handleCopyButtonMouseLeave}
            wrapperClassName="tooltip__wrapper mediainfo__toolbar__item">
            <Button
              priority="tertiary"
              buttonRef={ref => {
                this.copyButtonRef = ref;
              }}>
              <ClipboardIcon />
            </Button>
          </Tooltip>
        </div>
        <pre className="mediainfo__output">{this.props.mediainfo}</pre>
      </div>
    );
  }
}

const ConnectedTorrentMediainfo = connectStores(injectIntl(TorrentMediainfo), () => {
  return [
    {
      store: TorrentStore,
      event: EventTypes.FLOOD_FETCH_MEDIAINFO_SUCCESS,
      getValue: ({store, props}) => {
        return {
          mediainfo: store.getMediainfo(props.hash),
        };
      },
    },
  ];
});

export default ConnectedTorrentMediainfo;
