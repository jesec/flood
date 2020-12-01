import {FC, useEffect, useRef, useState} from 'react';
import {useIntl} from 'react-intl';

import {TorrentTrackerType} from '@shared/types/TorrentTracker';

import Checkmark from '../../icons/Checkmark';
import ClipboardIcon from '../../icons/ClipboardIcon';
import {Form, FormElementAddon, FormError, FormRow, Textbox} from '../../../ui';
import Modal from '../Modal';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';

const generateMagnet = (hash: string, trackers?: Array<string>): string => {
  let result = `magnet:?xt=urn:btih:${hash}`;

  if (trackers?.length) {
    trackers.forEach((tracker) => {
      result = `${result}&tr=${encodeURI(tracker)}`;
    });
  }

  return result;
};

const GenerateMagnetModal: FC = () => {
  const magnetTextboxRef = useRef<HTMLInputElement>(null);
  const magnetTrackersTextboxRef = useRef<HTMLInputElement>(null);
  const intl = useIntl();

  const [isMagnetCopied, setIsMagnetCopied] = useState<boolean>(false);
  const [isMagnetTrackersCopied, setIsMagnetTrackersCopied] = useState<boolean>(false);
  const [trackerState, setTrackerState] = useState<{
    isLoadingTrackers: boolean;
    magnetTrackersLink: string;
  }>({
    isLoadingTrackers: true,
    magnetTrackersLink: '',
  });

  useEffect(() => {
    TorrentActions.fetchTorrentTrackers(TorrentStore.selectedTorrents[0]).then((trackers) => {
      if (trackers != null) {
        setTrackerState({
          isLoadingTrackers: false,
          magnetTrackersLink: generateMagnet(
            TorrentStore.selectedTorrents[0],
            trackers.filter((tracker) => tracker.type !== TorrentTrackerType.DHT).map((tracker) => tracker.url),
          ),
        });
      }
    });
  }, []);

  const magnetLink = generateMagnet(TorrentStore.selectedTorrents[0]);

  return (
    <Modal
      heading={intl.formatMessage({
        id: 'torrents.generate.magnet.heading',
      })}
      content={
        <div className="modal__content inverse">
          <Form>
            {TorrentStore.torrents[TorrentStore.selectedTorrents[0]]?.isPrivate ? (
              <FormRow>
                <FormError>{intl.formatMessage({id: 'torrents.generate.magnet.private.torrent'})}</FormError>
              </FormRow>
            ) : null}
            <FormRow>
              <Textbox
                id="magnet"
                ref={magnetTextboxRef}
                addonPlacement="after"
                label={intl.formatMessage({id: 'torrents.generate.magnet.magnet'})}
                defaultValue={magnetLink}
                readOnly>
                <FormElementAddon
                  onClick={() => {
                    if (typeof navigator.clipboard?.writeText === 'function') {
                      navigator.clipboard.writeText(magnetLink).then(() => {
                        setIsMagnetCopied(true);
                      });
                    } else if (magnetTextboxRef.current != null) {
                      magnetTextboxRef.current?.select();
                      document.execCommand('copy');
                      setIsMagnetCopied(true);
                    }
                  }}>
                  {isMagnetCopied ? <Checkmark /> : <ClipboardIcon />}
                </FormElementAddon>
              </Textbox>
            </FormRow>
            <FormRow>
              {trackerState.isLoadingTrackers ? (
                <Textbox
                  id="loading"
                  label={intl.formatMessage({id: 'torrents.generate.magnet.magnet.with.trackers'})}
                  placeholder={intl.formatMessage({
                    id: 'torrents.generate.magnet.loading.trackers',
                  })}
                  disabled
                />
              ) : (
                <Textbox
                  id="magnet-trackers"
                  ref={magnetTrackersTextboxRef}
                  addonPlacement="after"
                  label={intl.formatMessage({id: 'torrents.generate.magnet.magnet.with.trackers'})}
                  defaultValue={trackerState.magnetTrackersLink}
                  readOnly>
                  <FormElementAddon
                    onClick={() => {
                      if (typeof navigator.clipboard?.writeText === 'function') {
                        navigator.clipboard.writeText(trackerState.magnetTrackersLink).then(() => {
                          setIsMagnetTrackersCopied(true);
                        });
                      } else if (magnetTrackersTextboxRef.current != null) {
                        magnetTrackersTextboxRef.current?.select();
                        document.execCommand('copy');
                        setIsMagnetTrackersCopied(true);
                      }
                    }}>
                    {isMagnetTrackersCopied ? <Checkmark /> : <ClipboardIcon />}
                  </FormElementAddon>
                </Textbox>
              )}
            </FormRow>
          </Form>
        </div>
      }
      actions={[
        {
          clickHandler: null,
          content: intl.formatMessage({
            id: 'button.close',
          }),
          triggerDismiss: true,
          type: 'tertiary',
        },
      ]}
    />
  );
};

export default GenerateMagnetModal;
