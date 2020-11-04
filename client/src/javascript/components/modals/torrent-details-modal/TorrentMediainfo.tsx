import axios from 'axios';
import Clipboard from 'clipboard';
import {Component} from 'react';
import {defineMessages, FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';

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

class TorrentMediainfo extends Component<WrappedComponentProps, TorrentMediainfoStates> {
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
    const {intl} = this.props;

    let headingMessage = MESSAGES.heading;
    if (this.isFetchingMediainfo) {
      headingMessage = MESSAGES.fetching;
    } else if (this.fetchMediainfoError) {
      headingMessage = MESSAGES.execError;
    }

    let tooltipMessage = MESSAGES.copy;
    if (this.state.copiedToClipboard) {
      tooltipMessage = MESSAGES.copied;
    }

    return (
      <div className="torrent-details__section mediainfo modal__content--nested-scroll__content">
        <div className="mediainfo__toolbar">
          <div className="mediainfo__toolbar__item">
            <span className="torrent-details__table__heading--tertiary">
              <FormattedMessage id={headingMessage.id} />
            </span>
          </div>
          {this.isFetchingMediainfo || this.fetchMediainfoError ? null : (
            <Tooltip
              content={intl.formatMessage(tooltipMessage)}
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
          )}
        </div>
        {this.fetchMediainfoError ? (
          <pre className="mediainfo__output mediainfo__output--error">{this.fetchMediainfoError.message}</pre>
        ) : (
          <pre className="mediainfo__output">{this.mediainfo}</pre>
        )}
      </div>
    );
  }
}

export default injectIntl(TorrentMediainfo);
