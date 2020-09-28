import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import {Form, FormRow, Textbox} from '../../../ui';
import Modal from '../Modal';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';

interface SetTrackerModalStates {
  isSettingTracker: boolean;
}

class SetTrackerModal extends React.Component<WrappedComponentProps, SetTrackerModalStates> {
  formRef: Form | null = null;

  constructor(props: WrappedComponentProps) {
    super(props);
    this.state = {
      isSettingTracker: false,
    };
  }

  handleSetTrackerClick = (): void => {
    if (this.formRef == null) {
      return;
    }

    const formData = this.formRef.getFormData() as {tracker: string};
    const {tracker} = formData;

    this.setState({isSettingTracker: true}, () =>
      TorrentActions.setTracker(TorrentStore.getSelectedTorrents(), tracker),
    );
  };

  getActions(): Modal['props']['actions'] {
    const primaryButtonText = this.props.intl.formatMessage({
      id: 'torrents.set.tracker.button.set',
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
        clickHandler: this.handleSetTrackerClick,
        content: primaryButtonText,
        isLoading: this.state.isSettingTracker,
        triggerDismiss: false,
        type: 'primary',
      },
    ];
  }

  getContent(): React.ReactNode {
    const trackerValue = TorrentStore.getSelectedTorrentsTrackerURIs()[0].join(', ');

    return (
      <div className="modal__content inverse">
        <Form
          ref={(ref) => {
            this.formRef = ref;
          }}>
          <FormRow>
            <Textbox
              defaultValue={trackerValue}
              id="tracker"
              placeholder={this.props.intl.formatMessage({
                id: 'torrents.set.tracker.enter.tracker',
              })}
            />
          </FormRow>
        </Form>
      </div>
    );
  }

  render() {
    return (
      <Modal
        actions={this.getActions()}
        content={this.getContent()}
        heading={this.props.intl.formatMessage({
          id: 'torrents.set.tracker.heading',
        })}
      />
    );
  }
}

export default injectIntl(SetTrackerModal);
