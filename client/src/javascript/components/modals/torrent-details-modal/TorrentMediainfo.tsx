import axios from 'axios';
import Clipboard from 'clipboard';
import {defineMessages, FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import {Button} from '../../../ui';
import ClipboardIcon from '../../icons/ClipboardIcon';
import Tooltip from '../../general/Tooltip';
import TorrentActions from '../../../actions/TorrentActions';
import UIStore from '../../../stores/UIStore';

const MESSAGES = defineMessages({
  copy: {
    id: 'general.clipboard.copy',
  },
  copied: {
    id: 'general.clipboard.copied',
  },
  execError: {
    id: 'mediainfo.execError',
  },
  fetching: {
    id: 'mediainfo.fetching',
  },
  heading: {
    id: 'mediainfo.heading',
  },
});

interface TorrentMediainfoStates {
  copiedToClipboard: boolean;
}

class TorrentMediainfo extends React.Component<WrappedComponentProps, TorrentMediainfoStates> {
  mediainfo: string | null = null;
  isFetchingMediainfo = true;
  fetchMediainfoError: Error | null = null;

  cancelToken = axios.CancelToken.source();
  clipboard: Clipboard | null = null;
  copyButtonRef: HTMLButtonElement | null = null;
  timeoutId: NodeJS.Timeout | null = null;

  constructor(props: WrappedComponentProps) {
    super(props);

    this.state = {
      copiedToClipboard: false,
    };

    if (UIStore.activeModal?.id === 'torrent-details') {
      TorrentActions.fetchMediainfo(UIStore.activeModal?.hash, this.cancelToken.token).then(
        (mediainfo) => {
          this.fetchMediainfoError = null;
          this.mediainfo = mediainfo.output;
          this.isFetchingMediainfo = false;
          this.forceUpdate();
        },
        (error) => {
          if (!axios.isCancel(error)) {
            this.fetchMediainfoError = error.response.data;
            this.isFetchingMediainfo = false;
            this.forceUpdate();
          }
        },
      );
    }
  }

  componentDidUpdate() {
    if (this.mediainfo === null) {
      return;
    }

    if (this.copyButtonRef && this.clipboard == null) {
      this.clipboard = new Clipboard(this.copyButtonRef, {
        text: () => this.mediainfo as string,
      });

      this.clipboard.on('success', this.handleCopySuccess);
    }
  }

  componentWillUnmount() {
    this.cancelToken.cancel();
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
    if (this.isFetchingMediainfo) {
      return (
        <div className="torrent-details__section mediainfo">
          <FormattedMessage id={MESSAGES.fetching.id} />
        </div>
      );
    }

    if (this.fetchMediainfoError) {
      return (
        <div className="torrent-details__section mediainfo">
          <p>
            <FormattedMessage id={MESSAGES.execError.id} />
          </p>
          <pre className="mediainfo__output mediainfo__output--error">{this.fetchMediainfoError.message}</pre>
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
              <FormattedMessage id={MESSAGES.heading.id} />
            </span>
          </div>
          <Tooltip
            content={tooltipText}
            onMouseLeave={this.handleCopyButtonMouseLeave}
            wrapperClassName="tooltip__wrapper mediainfo__toolbar__item">
            <Button
              priority="tertiary"
              buttonRef={(ref) => {
                this.copyButtonRef = ref;
              }}>
              <ClipboardIcon />
            </Button>
          </Tooltip>
        </div>
        <pre className="mediainfo__output">{this.mediainfo}</pre>
      </div>
    );
  }
}

export default injectIntl(TorrentMediainfo);
