import axios, {CancelTokenSource} from 'axios';
import {FC, useEffect, useRef, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {Button} from '@client/ui';
import {Checkmark, Clipboard} from '@client/ui/icons';
import TorrentActions from '@client/actions/TorrentActions';
import UIStore from '@client/stores/UIStore';

import Tooltip from '../../general/Tooltip';

const TorrentMediainfo: FC = () => {
  const {i18n} = useLingui();
  const cancelToken = useRef<CancelTokenSource>(axios.CancelToken.source());
  const clipboardRef = useRef<HTMLInputElement>(null);
  const [mediainfo, setMediainfo] = useState<string | null>(null);
  const [fetchMediainfoError, setFetchMediainfoError] = useState<Error | null>(null);
  const [isFetchingMediainfo, setIsFetchingMediainfo] = useState<boolean>(true);
  const [isCopiedToClipboard, setIsCopiedToClipboard] = useState<boolean>(false);

  useEffect(() => {
    const {current: currentCancelToken} = cancelToken;

    if (UIStore.activeModal?.id === 'torrent-details') {
      TorrentActions.fetchMediainfo(UIStore.activeModal?.hash, cancelToken.current.token).then(
        (fetchedMediainfo) => {
          setMediainfo(fetchedMediainfo.output);
          setIsFetchingMediainfo(false);
        },
        (error) => {
          if (!axios.isCancel(error)) {
            setFetchMediainfoError(error.response.data);
            setIsFetchingMediainfo(false);
          }
        },
      );
    }

    return () => {
      currentCancelToken.cancel();
    };
  }, []);

  let headingMessageId = 'mediainfo.heading';
  if (isFetchingMediainfo) {
    headingMessageId = 'mediainfo.fetching';
  } else if (fetchMediainfoError) {
    headingMessageId = 'mediainfo.execError';
  }

  return (
    <div className="torrent-details__section mediainfo modal__content--nested-scroll__content">
      <div className="mediainfo__toolbar">
        <div className="mediainfo__toolbar__item">
          <span className="torrent-details__table__heading--tertiary">
            <Trans id={headingMessageId} />
          </span>
        </div>
        {mediainfo && (
          <Tooltip
            content={i18n._(isCopiedToClipboard ? 'general.clipboard.copied' : 'general.clipboard.copy')}
            wrapperClassName="tooltip__wrapper mediainfo__toolbar__item"
          >
            <Button
              priority="tertiary"
              onClick={() => {
                if (mediainfo != null) {
                  if (typeof navigator.clipboard?.writeText === 'function') {
                    navigator.clipboard.writeText(mediainfo).then(() => {
                      setIsCopiedToClipboard(true);
                    });
                  } else if (clipboardRef.current != null) {
                    clipboardRef.current.value = mediainfo;
                    clipboardRef.current.select();
                    document.execCommand('copy');
                    setIsCopiedToClipboard(true);
                  }
                }
              }}
            >
              {isCopiedToClipboard ? <Checkmark /> : <Clipboard />}
            </Button>
          </Tooltip>
        )}
      </div>
      <input ref={clipboardRef} style={{width: '0.1px', height: '1px', position: 'absolute', right: 0}} />
      {fetchMediainfoError ? (
        <pre className="mediainfo__output mediainfo__output--error">{fetchMediainfoError.message}</pre>
      ) : (
        <pre className="mediainfo__output">{mediainfo}</pre>
      )}
    </div>
  );
};

export default TorrentMediainfo;
