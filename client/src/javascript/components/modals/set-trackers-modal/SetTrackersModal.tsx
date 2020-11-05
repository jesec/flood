import {Component} from 'react';
import {injectIntl, WrappedComponentProps} from 'react-intl';
import {observable, runInAction} from 'mobx';
import {observer} from 'mobx-react';

import {TorrentTrackerType} from '@shared/types/TorrentTracker';

import {Form, FormRow, Textbox} from '../../../ui';
import Modal from '../Modal';
import TextboxRepeater, {getTextArray} from '../../general/form-elements/TextboxRepeater';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';
import UIStore from '../../../stores/UIStore';

import type {ModalAction} from '../../../stores/UIStore';

interface SetTrackersModalStates {
  isLoadingTrackers: boolean;
  isSettingTrackers: boolean;
}

@observer
class SetTrackersModal extends Component<WrappedComponentProps, SetTrackersModalStates> {
  trackerURLs = observable.array<string>([]);
  formRef: Form | null = null;

  constructor(props: WrappedComponentProps) {
    super(props);

    TorrentActions.fetchTorrentTrackers(TorrentStore.selectedTorrents[0]).then((trackers) => {
      if (trackers != null) {
        runInAction(() => {
          this.trackerURLs.replace(
            trackers.filter((tracker) => tracker.type !== TorrentTrackerType.DHT).map((tracker) => tracker.url),
          );
          this.setState({isLoadingTrackers: false});
        });
      }
    });

    this.state = {
      isSettingTrackers: false,
      isLoadingTrackers: true,
    };
  }

  getActions(): Array<ModalAction> {
    const primaryButtonText = this.props.intl.formatMessage({
      id: 'torrents.set.trackers.button.set',
    });

    return [
      {
        clickHandler: null,
        content: this.props.intl.formatMessage({
          id: 'button.cancel',
        }),
        triggerDismiss: true,
        type: 'tertiary',
      },
      {
        clickHandler: this.handleSetTrackersClick,
        content: primaryButtonText,
        isLoading: this.state.isSettingTrackers || this.state.isLoadingTrackers,
        triggerDismiss: false,
        type: 'primary',
      },
    ];
  }

  handleSetTrackersClick = (): void => {
    if (this.formRef == null || this.state.isSettingTrackers || this.state.isLoadingTrackers) {
      return;
    }

    this.setState({isSettingTrackers: true});

    const formData = this.formRef.getFormData() as Record<string, string>;
    const trackers = getTextArray(formData, 'trackers').filter((tracker) => tracker !== '');

    TorrentActions.setTrackers({hashes: TorrentStore.selectedTorrents, trackers}).then(() => {
      this.setState({isSettingTrackers: false});
      UIStore.dismissModal();
    });
  };

  render() {
    return (
      <Modal
        actions={this.getActions()}
        content={
          <div className="modal__content inverse">
            <Form
              ref={(ref) => {
                this.formRef = ref;
              }}>
              {this.state.isLoadingTrackers ? (
                <FormRow>
                  <Textbox
                    id="loading"
                    placeholder={this.props.intl.formatMessage({
                      id: 'torrents.set.trackers.loading.trackers',
                    })}
                  />
                </FormRow>
              ) : (
                <TextboxRepeater
                  id="trackers"
                  placeholder={this.props.intl.formatMessage({
                    id: 'torrents.set.trackers.enter.tracker',
                  })}
                  defaultValues={
                    this.trackerURLs.length === 0
                      ? undefined
                      : this.trackerURLs.map((url, index) => ({id: index, value: url}))
                  }
                />
              )}
            </Form>
          </div>
        }
        heading={this.props.intl.formatMessage({
          id: 'torrents.set.trackers.heading',
        })}
      />
    );
  }
}

export default injectIntl(SetTrackersModal);
