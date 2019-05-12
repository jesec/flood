import _ from 'lodash';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';
import {
  Button,
  Checkbox,
  Form,
  FormError,
  FormRow,
  FormRowGroup,
  FormRowItem,
  Select,
  SelectItem,
  Textbox,
} from 'flood-ui-kit';
import formatUtil from 'universally-shared-code/util/formatUtil';
import React from 'react';

import Edit from '../../icons/Edit';
import Close from '../../icons/Close';
import EventTypes from '../../../constants/EventTypes';
import FeedMonitorStore from '../../../stores/FeedMonitorStore';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import * as validators from '../../../util/validators';
import UIActions from '../../../actions/UIActions';

const MESSAGES = defineMessages({
  mustSpecifyURL: {
    id: 'feeds.validation.must.specify.valid.feed.url',
    defaultMessage: 'You must specify a valid feed URL.',
  },
  mustSpecifyLabel: {
    id: 'feeds.validation.must.specify.label',
    defaultMessage: 'You must specify a label.',
  },
  intervalNotPositive: {
    id: 'feeds.validation.interval.not.positive',
    defaultMessage: 'The interval must be a positive integer.',
  },
  min: {
    id: 'feeds.time.min',
    defaultMessage: 'Minutes',
  },
  hr: {
    id: 'feeds.time.hr',
    defaultMessage: 'Hours',
  },
  day: {
    id: 'feeds.time.day',
    defaultMessage: 'Days',
  },
  url: {
    id: 'feeds.url',
    defaultMessage: 'URL',
  },
  label: {
    id: 'feeds.label',
    defaultMessage: 'Label',
  },
  interval: {
    id: 'feeds.interval',
    defaultMessage: 'Interval',
  },
  tags: {
    id: 'feeds.tags',
    defaultMessage: 'Tags',
  },
  search: {
    id: 'feeds.search',
    defaultMessage: 'Search term',
  },
});

const defaultFeed = {
  label: '',
  interval: 5,
  url: '',
};

class FeedsTab extends React.Component {
  state = {
    errors: {},
    intervalmultipliers: [
      {
        displayName: this.props.intl.formatMessage(MESSAGES.min),
        value: 1,
      },
      {
        displayName: this.props.intl.formatMessage(MESSAGES.hr),
        value: 60,
      },
      {
        displayName: this.props.intl.formatMessage(MESSAGES.day),
        value: 1440,
      },
    ],
    feeds: FeedMonitorStore.getFeeds(),
    rules: FeedMonitorStore.getRules(),
    items: FeedMonitorStore.getItems(),
    currentlyEditingFeed: null,
    selectedFeed: null,
  };

  componentDidMount() {
    FeedMonitorStore.listen(EventTypes.SETTINGS_FEED_MONITORS_FETCH_SUCCESS, this.handleFeedMonitorsFetchSuccess);
    FeedMonitorStore.listen(EventTypes.SETTINGS_FEED_MONITOR_ITEMS_FETCH_SUCCESS, this.handleFeedItemsFetchSuccess);
  }

  componentWillUnmount() {
    FeedMonitorStore.unlisten(EventTypes.SETTINGS_FEED_MONITORS_FETCH_SUCCESS, this.handleFeedMonitorsFetchSuccess);
    FeedMonitorStore.unlisten(EventTypes.SETTINGS_FEED_MONITOR_ITEMS_FETCH_SUCCESS, this.handleFeedItemsFetchSuccess);
  }

  formRef;

  manualAddingFormRef;

  validatedFields = {
    url: {
      isValid: validators.isURLValid,
      error: this.props.intl.formatMessage(MESSAGES.mustSpecifyURL),
    },
    label: {
      isValid: validators.isNotEmpty,
      error: this.props.intl.formatMessage(MESSAGES.mustSpecifyLabel),
    },
    interval: {
      isValid: validators.isPositiveInteger,
      error: this.props.intl.formatMessage(MESSAGES.intervalNotPositive),
    },
  };

  checkFieldValidity = _.throttle((fieldName, fieldValue) => {
    const {errors} = this.state;

    if (this.state.errors[fieldName] && this.validatedFields[fieldName].isValid(fieldValue)) {
      delete errors[fieldName];
      this.setState({errors});
    }
  }, 150);

  getAmendedFormData() {
    const formData = this.formRef.getFormData();
    formData.interval = (formData.interval * formData.intervalMultiplier).toString();
    delete formData.intervalMultiplier;

    return formData;
  }

  getIntervalSelectOptions() {
    return this.state.intervalmultipliers.map(interval => (
      <SelectItem key={interval.value} id={interval.value}>
        {interval.displayName}
      </SelectItem>
    ));
  }

  getAvailableFeedsOptions() {
    if (!this.state.feeds.length) {
      return [
        <SelectItem key="empty" id="placeholder" placeholder>
          <em>
            <FormattedMessage id="feeds.no.feeds.available" defaultMessage="No feeds available." />
          </em>
        </SelectItem>,
      ];
    }

    return this.state.feeds.reduce(
      (feedOptions, feed) =>
        feedOptions.concat(
          <SelectItem key={feed._id} id={feed._id}>
            {feed.label}
          </SelectItem>,
        ),
      [
        <SelectItem key="select-feed" id="placeholder" placeholder>
          <em>
            <FormattedMessage id="feeds.select.feed" defaultMessage="Select feed" />
          </em>
        </SelectItem>,
      ],
    );
  }

  getModifyFeedForm(feed) {
    const isDayInterval = feed.interval % 1440;
    const minutesDivisor = feed.interval % 60 ? 1 : 60;
    const defaultIntervalTextValue = feed.interval / isDayInterval ? minutesDivisor : 1440;
    const defaultIntervalMultiplierId = isDayInterval ? minutesDivisor : 1440;

    return (
      <FormRowGroup>
        <FormRow>
          <Textbox
            id="label"
            label={this.props.intl.formatMessage(MESSAGES.label)}
            placeholder={this.props.intl.formatMessage(MESSAGES.label)}
            defaultValue={feed.label}
          />
          <Textbox
            id="interval"
            label={this.props.intl.formatMessage({
              id: 'feeds.select.interval',
              defaultMessage: 'Interval',
            })}
            placeholder={this.props.intl.formatMessage(MESSAGES.interval)}
            defaultValue={defaultIntervalTextValue}
            width="one-eighth"
          />
          <Select labelOffset defaultID={defaultIntervalMultiplierId} id="intervalMultiplier" width="one-eighth">
            {this.getIntervalSelectOptions()}
          </Select>
        </FormRow>
        <FormRow>
          <Textbox
            id="url"
            label={this.props.intl.formatMessage({
              id: 'feeds.url',
              defaultMessage: 'URL',
            })}
            placeholder={this.props.intl.formatMessage(MESSAGES.url)}
            defaultValue={feed.url}
          />
          <Button labelOffset onClick={() => this.setState({currentlyEditingFeed: null})}>
            <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
          </Button>
          <Button labelOffset type="submit">
            <FormattedMessage id="button.save.feed" defaultMessage="Save" />
          </Button>
        </FormRow>
      </FormRowGroup>
    );
  }

  getFeedsListItem(feed) {
    const matchedCount = feed.count || 0;
    return (
      <li className="interactive-list__item interactive-list__item--stacked-content feed-list__feed" key={feed._id}>
        <div className="interactive-list__label">
          <ul className="interactive-list__detail-list">
            <li
              className="interactive-list__detail-list__item
              interactive-list__detail--primary">
              {feed.label}
            </li>
            <li
              className="interactive-list__detail-list__item
              interactive-list__detail-list__item--overflow
              interactive-list__detail interactive-list__detail--secondary">
              <FormattedMessage
                id="feeds.match.count"
                defaultMessage="{count, plural, =1 {# match} other
                  {# matches}}"
                values={{count: matchedCount}}
              />
            </li>
            {feed === this.state.currentlyEditingFeed && (
              <li
                className="interactive-list__detail-list__item
              interactive-list__detail--primary">
                Modifying
              </li>
            )}
          </ul>
          <ul className="interactive-list__detail-list">
            <li
              className="interactive-list__detail-list__item
              interactive-list__detail interactive-list__detail--tertiary">
              {formatUtil.minToHumanReadable(feed.interval)}
            </li>
            <li
              className="interactive-list__detail-list__item
              interactive-list__detail-list__item--overflow
              interactive-list__detail interactive-list__detail--tertiary">
              <a href={feed.url} rel="noopener noreferrer" target="_blank">
                {feed.url}
              </a>
            </li>
          </ul>
        </div>
        <span
          className="interactive-list__icon interactive-list__icon--action"
          onClick={() => this.handleModifyFeedClick(feed)}>
          <Edit />
        </span>
        <span
          className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
          onClick={() => this.handleRemoveFeedClick(feed)}>
          <Close />
        </span>
      </li>
    );
  }

  getFeedAddForm(errors) {
    return (
      <Form
        className="inverse"
        onChange={this.handleFormChange}
        onSubmit={this.handleFormSubmit}
        ref={ref => {
          this.formRef = ref;
        }}>
        <ModalFormSectionHeader>
          <FormattedMessage id="feeds.existing.feeds" defaultMessage="Existing Feeds" />
        </ModalFormSectionHeader>
        {errors}
        <FormRow>
          <FormRowItem>{this.getFeedsList()}</FormRowItem>
        </FormRow>
        {this.state.currentlyEditingFeed ? (
          this.getModifyFeedForm(this.state.currentlyEditingFeed)
        ) : (
          <FormRow>
            <FormRowItem width="auto" />
            <Button onClick={() => this.handleAddFeedClick()}>
              <FormattedMessage id="button.new" defaultMessage="New" />
            </Button>
          </FormRow>
        )}
      </Form>
    );
  }

  getFeedsList() {
    if (this.state.feeds.length === 0) {
      return (
        <ul className="interactive-list">
          <li className="interactive-list__item">
            <FormattedMessage defaultMessage="No feeds defined." id="feeds.no.feeds.defined" />
          </li>
        </ul>
      );
    }

    const feedsList = this.state.feeds.map(feed => this.getFeedsListItem(feed));

    return <ul className="interactive-list feed-list">{feedsList}</ul>;
  }

  getFeedItemsForm() {
    return (
      <Form
        className="inverse"
        onChange={this.handleBrowseFeedChange}
        onSubmit={this.handleBrowseFeedSubmit}
        ref={ref => {
          this.manualAddingFormRef = ref;
        }}>
        <ModalFormSectionHeader>
          <FormattedMessage id="feeds.browse.feeds" defaultMessage="Browse feeds" />
        </ModalFormSectionHeader>
        <FormRow>
          <Select
            disabled={!this.state.feeds.length}
            grow={false}
            id="feedID"
            label={this.props.intl.formatMessage({
              id: 'feeds.select.feed',
              defaultMessage: 'Select feed',
            })}
            width="three-eighths">
            {this.getAvailableFeedsOptions()}
          </Select>
          {this.renderSearchField()}
          {this.renderDownloadButton()}
        </FormRow>
        {this.state.selectedFeed && <FormRow>{this.getFeedItemsList()}</FormRow>}
      </Form>
    );
  }

  getFeedItemsList() {
    if (this.state.items.length === 0) {
      return (
        <ul className="interactive-list">
          <li className="interactive-list__item">
            <div className="interactive-list__label">
              <FormattedMessage defaultMessage="No items matching search term." id="feeds.no.items.matching" />
            </div>
          </li>
        </ul>
      );
    }

    const itemsList = this.state.items.map((item, index) => (
      <li className="interactive-list__item interactive-list__item--stacked-content feed-list__feed" key={item.title}>
        <div className="interactive-list__label feed-list__feed-label">{item.title}</div>
        <Checkbox id={index} />
      </li>
    ));

    return <ul className="interactive-list feed-list">{itemsList}</ul>;
  }

  getSelectedDropdownItem(itemSet) {
    return this.state[itemSet].find(item => item.selected);
  }

  handleFormSubmit = () => {
    const {errors, isValid} = this.validateForm();

    if (!isValid) {
      this.setState({errors});
    } else {
      const currentFeed = this.state.currentlyEditingFeed;
      const formData = this.getAmendedFormData();

      if (currentFeed === defaultFeed) {
        FeedMonitorStore.addFeed(formData);
      } else {
        FeedMonitorStore.modifyFeed(currentFeed._id, formData);
      }
      this.formRef.resetForm();
      this.setState({currentlyEditingFeed: null});
    }
  };

  handleFeedMonitorsFetchSuccess = () => {
    this.setState({
      feeds: FeedMonitorStore.getFeeds(),
      rules: FeedMonitorStore.getRules(),
    });
  };

  handleFeedItemsFetchSuccess = () => {
    this.setState({
      items: FeedMonitorStore.getItems() || [],
    });
  };

  handleFormChange = ({event, formData}) => {
    this.checkFieldValidity(event.target.name, formData[event.target.name]);
  };

  handleRemoveFeedClick = feed => {
    FeedMonitorStore.removeFeed(feed._id);

    if (feed === this.state.currentlyEditingFeed) {
      this.setState({currentlyEditingFeed: null});
    }
  };

  handleAddFeedClick = () => {
    this.setState({currentlyEditingFeed: defaultFeed});
  };

  handleModifyFeedClick = feed => {
    this.setState({currentlyEditingFeed: feed});
  };

  handleBrowseFeedChange = input => {
    if (input.event.target.type !== 'checkbox') {
      this.setState({selectedFeed: input.formData.feedID});
      FeedMonitorStore.fetchItems({params: {id: input.formData.feedID, search: input.formData.search}});
    }
  };

  handleBrowseFeedSubmit = () => {
    const formData = this.manualAddingFormRef.getFormData();

    const downloadedTorrents = this.state.items
      .filter((item, index) => formData[index])
      .map((torrent, index) => ({id: index, value: torrent.link}));

    UIActions.displayModal({id: 'add-torrents', torrents: downloadedTorrents});
  };

  validateForm() {
    const formData = this.formRef.getFormData();
    const errors = Object.keys(this.validatedFields).reduce((memo, fieldName) => {
      const fieldValue = formData[fieldName];

      if (!this.validatedFields[fieldName].isValid(fieldValue)) {
        memo[fieldName] = this.validatedFields[fieldName].error;
      }

      return memo;
    }, {});

    return {errors, isValid: !Object.keys(errors).length};
  }

  renderSearchField = () => {
    const {selectedFeed} = this.state;

    if (selectedFeed == null) return null;

    return (
      <Textbox
        id="search"
        label={this.props.intl.formatMessage({
          id: 'feeds.search.term',
          defaultMessage: 'Search term',
        })}
        placeholder={this.props.intl.formatMessage(MESSAGES.search)}
      />
    );
  };

  renderDownloadButton = () => {
    const {selectedFeed} = this.state;

    if (selectedFeed == null) return null;

    return (
      <Button key="button" type="submit" labelOffset>
        <FormattedMessage id="button.download" defaultMessage="Download" />
      </Button>
    );
  };

  render() {
    const errors = Object.keys(this.state.errors).map(errorID => (
      <FormRow key={errorID}>
        <FormError>{this.state.errors[errorID]}</FormError>
      </FormRow>
    ));
    return (
      <div>
        {this.getFeedAddForm(errors)}
        {this.getFeedItemsForm()}
      </div>
    );
  }
}

export default injectIntl(FeedsTab);
