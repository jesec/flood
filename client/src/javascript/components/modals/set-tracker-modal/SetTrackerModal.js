import {injectIntl} from 'react-intl';
import React from 'react';

import {Form, FormRow, Textbox} from '../../../ui';
import Modal from '../Modal';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';

class SetTrackerModal extends React.Component {
  formRef = null;

  constructor(props) {
    super(props);
    this.state = {
      isSettingTracker: false,
    };
  }

  handleSetTrackerClick = () => {
    const formData = this.formRef.getFormData();
    const {tracker} = formData;

    this.setState({isSettingTracker: true}, () =>
      TorrentActions.setTracker(TorrentStore.getSelectedTorrents(), tracker),
    );
  };

  getActions() {
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

  getContent() {
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
        dismiss={this.props.dismiss}
        heading={this.props.intl.formatMessage({
          id: 'torrents.set.tracker.heading',
        })}
      />
    );
  }
}

export default injectIntl(SetTrackerModal);
