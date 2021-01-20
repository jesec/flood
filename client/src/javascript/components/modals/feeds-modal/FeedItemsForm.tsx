import {FC, useRef, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {observer} from 'mobx-react';

import {Button, Form, FormRow, Select, SelectItem, Textbox} from '@client/ui';
import FeedActions from '@client/actions/FeedActions';
import FeedStore from '@client/stores/FeedStore';
import UIActions from '@client/actions/UIActions';

import FeedItems from './FeedItems';
import ModalFormSectionHeader from '../ModalFormSectionHeader';

const FeedItemsForm: FC = observer(() => {
  const intl = useIntl();
  const manualAddingFormRef = useRef<Form>(null);
  const [selectedFeedID, setSelectedFeedID] = useState<string | null>(null);

  const {feeds} = FeedStore;

  if (selectedFeedID != null) {
    if (!feeds.some((feed) => feed._id === selectedFeedID)) {
      setSelectedFeedID(null);
    }
  }

  return (
    <Form
      className="inverse"
      onChange={({event, formData}) => {
        const feedBrowseForm = formData as {feedID: string; search: string};
        if ((event.target as HTMLInputElement).type !== 'checkbox') {
          setSelectedFeedID(feedBrowseForm.feedID);
          FeedActions.fetchItems({
            id: feedBrowseForm.feedID,
            search: feedBrowseForm.search,
          });
        }
      }}
      onSubmit={() => {
        if (manualAddingFormRef.current == null) {
          return;
        }

        const formData = manualAddingFormRef.current.getFormData();

        // TODO: Properly handle array of array of URLs
        const torrentsToDownload = FeedStore.items
          .filter((_item, index) => formData[index])
          .map((item, index) => ({id: index, value: item.urls[0]}));

        UIActions.displayModal({
          id: 'add-torrents',
          initialURLs: torrentsToDownload,
        });
      }}
      ref={manualAddingFormRef}>
      <ModalFormSectionHeader>
        <FormattedMessage id="feeds.browse.feeds" />
      </ModalFormSectionHeader>
      <FormRow>
        <Select
          disabled={!feeds.length}
          grow={false}
          id="feedID"
          label={intl.formatMessage({
            id: 'feeds.select.feed',
          })}
          width="three-eighths">
          {!feeds.length
            ? [
                <SelectItem key="empty" id="placeholder" placeholder>
                  <em>
                    <FormattedMessage id="feeds.no.feeds.available" />
                  </em>
                </SelectItem>,
              ]
            : feeds.reduce(
                (feedOptions, feed) => {
                  if (feed._id == null) {
                    return feedOptions;
                  }

                  return feedOptions.concat(
                    <SelectItem key={feed._id} id={feed._id}>
                      {feed.label}
                    </SelectItem>,
                  );
                },
                [
                  <SelectItem key="select-feed" id="placeholder" placeholder>
                    <em>
                      <FormattedMessage id="feeds.select.feed" />
                    </em>
                  </SelectItem>,
                ],
              )}
        </Select>
        {selectedFeedID && (
          <Textbox
            id="search"
            label={intl.formatMessage({
              id: 'feeds.search.term',
            })}
            placeholder={intl.formatMessage({
              id: 'feeds.search',
            })}
          />
        )}
        {selectedFeedID && (
          <Button key="button" type="submit" labelOffset>
            <FormattedMessage id="button.download" />
          </Button>
        )}
      </FormRow>
      {selectedFeedID && <FeedItems selectedFeedID={selectedFeedID} />}
    </Form>
  );
});

export default FeedItemsForm;
