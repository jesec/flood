import {Button} from 'flood-ui-kit';
import Clipboard from 'clipboard';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import ClipboardIcon from '../../icons/ClipboardIcon';
import EventTypes from '../../../constants/EventTypes';
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

const METHODS_TO_BIND = [
  'handleCopyButtonMouseLeave',
  'handleCopySuccess',
  'handleFetchMediainfoError',
  'handleFetchMediainfoSuccess',
];

class TorrentMediainfo extends React.Component {
  constructor() {
    super();

    this.clipboard = null;
    this.state = {
      copiedToClipboard: false,
      isFetchingMediainfo: true,
      mediainfo: null,
      fetchMediainfoError: null,
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.FLOOD_FETCH_MEDIAINFO_SUCCESS, this.handleFetchMediainfoSuccess);
    TorrentStore.listen(EventTypes.FLOOD_FETCH_MEDIAINFO_ERROR, this.handleFetchMediainfoError);
    TorrentStore.fetchMediainfo(this.props.hash);
  }

  componentDidUpdate() {
    if (this.copyButtonRef && this.clipboard == null) {
      this.clipboard = new Clipboard(this.copyButtonRef, {
        text: () => {
          return this.state.mediainfo;
        },
      });

      this.clipboard.on('success', this.handleCopySuccess);
    }
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.FLOOD_FETCH_MEDIAINFO_SUCCESS, this.handleFetchMediainfoSuccess);
    TorrentStore.unlisten(EventTypes.FLOOD_FETCH_MEDIAINFO_ERROR, this.handleFetchMediainfoError);
  }

  handleCopyButtonMouseLeave() {
    global.setTimeout(() => {
      this.setState({
        copiedToClipboard: false,
      });
    }, 500);
  }

  handleCopySuccess() {
    this.setState({
      copiedToClipboard: true,
    });
  }

  handleFetchMediainfoError(error) {
    this.setState({
      isFetchingMediainfo: false,
      fetchMediainfoError: error,
    });
  }

  handleFetchMediainfoSuccess() {
    this.setState({
      mediainfo: TorrentStore.getMediainfo(this.props.hash),
      isFetchingMediainfo: false,
      fetchMediainfoError: null,
    });
  }

  render() {
    if (this.state.isFetchingMediainfo) {
      return (
        <div className="torrent-details__section mediainfo">
          <FormattedMessage id={MESSAGES.fetching.id} defaultMessage={MESSAGES.fetching.defaultMessage} />
        </div>
      );
    }

    if (this.state.fetchMediainfoError) {
      let errorData = this.state.fetchMediainfoError.data || {};

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
            <Button priority="tertiary" buttonRef={ref => (this.copyButtonRef = ref)}>
              <ClipboardIcon />
            </Button>
          </Tooltip>
        </div>
        <pre className="mediainfo__output">{this.state.mediainfo}</pre>
      </div>
    );
  }
}

export default injectIntl(TorrentMediainfo);
