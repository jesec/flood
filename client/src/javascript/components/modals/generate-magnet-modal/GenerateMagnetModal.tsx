import {FC, useEffect, useRef, useState} from 'react';
import {useLingui} from '@lingui/react';

import {CheckmarkThick, Clipboard} from '@client/ui/icons';
import {Form, FormElementAddon, FormError, FormRow, Textbox} from '@client/ui';
import TorrentActions from '@client/actions/TorrentActions';
import TorrentStore from '@client/stores/TorrentStore';

import {TorrentTrackerType} from '@shared/types/TorrentTracker';

import Modal from '../Modal';

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
  const {i18n} = useLingui();

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
      heading={i18n._('torrents.generate.magnet.heading')}
      content={
        <div className="modal__content inverse">
          <Form>
            {TorrentStore.torrents[TorrentStore.selectedTorrents[0]]?.isPrivate ? (
              <FormRow>
                <FormError>{i18n._('torrents.generate.magnet.private.torrent')}</FormError>
              </FormRow>
            ) : null}
            <FormRow>
              <Textbox
                id="magnet"
                ref={magnetTextboxRef}
                addonPlacement="after"
                label={i18n._('torrents.generate.magnet.magnet')}
                defaultValue={magnetLink}
                readOnly
              >
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
                  }}
                >
                  {isMagnetCopied ? <CheckmarkThick /> : <Clipboard />}
                </FormElementAddon>
              </Textbox>
            </FormRow>
            <FormRow>
              {trackerState.isLoadingTrackers ? (
                <Textbox
                  id="loading"
                  label={i18n._('torrents.generate.magnet.magnet.with.trackers')}
                  placeholder={i18n._('torrents.generate.magnet.loading.trackers')}
                  disabled
                />
              ) : (
                <Textbox
                  id="magnet-trackers"
                  ref={magnetTrackersTextboxRef}
                  addonPlacement="after"
                  label={i18n._('torrents.generate.magnet.magnet.with.trackers')}
                  defaultValue={trackerState.magnetTrackersLink}
                  readOnly
                >
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
                    }}
                  >
                    {isMagnetTrackersCopied ? <CheckmarkThick /> : <Clipboard />}
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
          content: i18n._('button.close'),
          triggerDismiss: true,
          type: 'tertiary',
        },
      ]}
    />
  );
};

export default GenerateMagnetModal;
