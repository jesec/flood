import {FC, useEffect, useRef, useState} from 'react';
import {useLingui} from '@lingui/react';

import {Form, FormRow, Textbox} from '@client/ui';
import TorrentActions from '@client/actions/TorrentActions';
import TorrentStore from '@client/stores/TorrentStore';
import UIStore from '@client/stores/UIStore';

import {TorrentTrackerType} from '@shared/types/TorrentTracker';

import Modal from '../Modal';
import TextboxRepeater, {getTextArray} from '../../general/form-elements/TextboxRepeater';

const SetTrackersModal: FC = () => {
  const formRef = useRef<Form>(null);
  const {i18n} = useLingui();
  const [isSettingTrackers, setIsSettingTrackers] = useState<boolean>(false);
  const [trackerState, setTrackerState] = useState<{
    isLoadingTrackers: boolean;
    trackerURLs: Array<string>;
  }>({
    isLoadingTrackers: true,
    trackerURLs: [],
  });

  useEffect(() => {
    TorrentActions.fetchTorrentTrackers(TorrentStore.selectedTorrents[0]).then((trackers) => {
      if (trackers != null) {
        setTrackerState({
          isLoadingTrackers: false,
          trackerURLs: trackers
            .filter((tracker) => tracker.type !== TorrentTrackerType.DHT)
            .map((tracker) => tracker.url),
        });
      }
    });
  }, []);

  return (
    <Modal
      heading={i18n._('torrents.set.trackers.heading')}
      content={
        <div className="modal__content inverse">
          <Form ref={formRef}>
            {trackerState.isLoadingTrackers ? (
              <FormRow>
                <Textbox id="loading" placeholder={i18n._('torrents.set.trackers.loading.trackers')} disabled />
              </FormRow>
            ) : (
              <TextboxRepeater
                id="trackers"
                placeholder={i18n._('torrents.set.trackers.enter.tracker')}
                defaultValues={
                  trackerState.trackerURLs.length === 0
                    ? undefined
                    : trackerState.trackerURLs.map((url, index) => ({
                        id: index,
                        value: url,
                      }))
                }
              />
            )}
          </Form>
        </div>
      }
      actions={[
        {
          clickHandler: null,
          content: i18n._('button.cancel'),
          triggerDismiss: true,
          type: 'tertiary',
        },
        {
          clickHandler: () => {
            if (formRef.current == null || isSettingTrackers || trackerState.isLoadingTrackers) {
              return;
            }

            setIsSettingTrackers(true);

            const formData = formRef.current.getFormData() as Record<string, string>;
            const trackers = getTextArray(formData, 'trackers').filter((tracker) => tracker !== '');

            TorrentActions.setTrackers({
              hashes: TorrentStore.selectedTorrents,
              trackers,
            }).then(() => {
              setIsSettingTrackers(false);
              UIStore.setActiveModal(null);
            });
          },
          content: i18n._('torrents.set.trackers.button.set'),
          isLoading: isSettingTrackers || trackerState.isLoadingTrackers,
          triggerDismiss: false,
          type: 'primary',
        },
      ]}
    />
  );
};

export default SetTrackersModal;
