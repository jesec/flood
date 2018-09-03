import _ from 'lodash';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';
import {Button, Form, FormError, FormRow, FormRowGroup, FormRowItem, Select, SelectItem, Textbox} from 'flood-ui-kit';
import formatUtil from 'universally-shared-code/util/formatUtil';
import React from 'react';

import Close from '../../icons/Close';
import EventTypes from '../../../constants/EventTypes';
import FeedMonitorStore from '../../../stores/FeedMonitorStore';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import Validator from '../../../util/Validator';

const MESSAGES = defineMessages({
  mustSpecifyURL: {
    id: 'feeds.validation.must.specify.valid.feed.url',
    defaultMessage: 'You must specify a valid feed URL.',
  },
  mustSpecifyLabel: {
    id: 'feeds.validation.must.specify.label',
    defaultMessage: 'You must specify a label.',
  },
  min: {
    id: 'feeds.time.min',
    defaultMessage: '{durationValue} min',
  },
  hr: {
    id: 'feeds.time.hr',
    defaultMessage: '{durationValue} hr',
  },
  url: {
    id: 'feeds.url',
    defaultMessage: 'URL',
  },
  label: {
    id: 'feeds.label',
    defaultMessage: 'Label',
  },
});

class FeedsTab extends React.Component {
  formRef;
  validatedFields = {
    url: {
      isValid: Validator.isURLValid,
      error: this.props.intl.formatMessage(MESSAGES.mustSpecifyURL),
    },
    label: {
      isValid: Validator.isNotEmpty,
      error: this.props.intl.formatMessage(MESSAGES.mustSpecifyLabel),
    },
  };

  state = {
    errors: {},
    intervals: [
      {
        displayName: this.props.intl.formatMessage(MESSAGES.min, {durationValue: 5}),
        value: 5,
      },
      {
        displayName: this.props.intl.formatMessage(MESSAGES.min, {durationValue: 15}),
        value: 15,
      },
      {
        displayName: this.props.intl.formatMessage(MESSAGES.min, {durationValue: 30}),
        value: 30,
      },
      {
        displayName: this.props.intl.formatMessage(MESSAGES.hr, {durationValue: 5}),
        value: 60,
      },
    ],
    feeds: FeedMonitorStore.getFeeds(),
    rules: FeedMonitorStore.getRules(),
  };

  componentDidMount() {
    FeedMonitorStore.listen(EventTypes.SETTINGS_FEED_MONITORS_FETCH_SUCCESS, this.handleFeedMonitorsFetchSuccess);
  }

  componentWillUnmount() {
    FeedMonitorStore.unlisten(EventTypes.SETTINGS_FEED_MONITORS_FETCH_SUCCESS, this.handleFeedMonitorsFetchSuccess);
  }

  checkFieldValidity = _.throttle((fieldName, fieldValue) => {
    const {errors} = this.state;

    if (this.state.errors[fieldName] && this.validatedFields[fieldName].isValid(fieldValue)) {
      delete errors[fieldName];
      this.setState({errors});
    }
  }, 150);

  getIntervalSelectOptions() {
    return this.state.intervals.map((interval, index) => {
      return (
        <SelectItem key={index} id={interval.value}>
          {interval.displayName}
        </SelectItem>
      );
    });
  }

  getAddFeedForm() {
    return (
      <FormRowGroup>
        <FormRow>
          <Textbox
            id="label"
            label={this.props.intl.formatMessage(MESSAGES.label)}
            placeholder={this.props.intl.formatMessage(MESSAGES.label)}
          />
          <Select
            defaultID={this.state.intervals[0].value}
            label={this.props.intl.formatMessage({
              id: 'feeds.interval',
              defaultMessage: 'Interval',
            })}
            id="interval"
            width="one-quarter">
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
          />
          <Button labelOffset type="submit">
            <FormattedMessage id="button.add" defaultMessage="Add" />
          </Button>
        </FormRow>
      </FormRowGroup>
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

    const feedsList = this.state.feeds.map((feed, index) => {
      let matchedCount = feed.count || 0;

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
                <a href={feed.url} target="_blank">
                  {feed.url}
                </a>
              </li>
            </ul>
          </div>
          <span
            className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
            onClick={() => this.handleRemoveFeedClick(feed)}>
            <Close />
          </span>
        </li>
      );
    });

    return <ul className="interactive-list feed-list">{feedsList}</ul>;
  }

  getSelectedDropdownItem(itemSet) {
    return this.state[itemSet].find(item => {
      return item.selected;
    });
  }

  handleFormSubmit = () => {
    const {errors, isValid} = this.validateForm();

    if (!isValid) {
      this.setState({errors});
    } else {
      FeedMonitorStore.addFeed(this.formRef.getFormData());
      this.formRef.resetForm();
    }
  };

  handleFeedMonitorsFetchSuccess = () => {
    this.setState({
      feeds: FeedMonitorStore.getFeeds(),
      rules: FeedMonitorStore.getRules(),
    });
  };

  handleFormChange = ({event, formData}) => {
    this.checkFieldValidity(event.target.name, formData[event.target.name]);
  };

  handleRemoveFeedClick = feed => {
    FeedMonitorStore.removeFeed(feed._id);
  };

  validateForm() {
    const formData = this.formRef.getFormData();
    const errors = Object.keys(this.validatedFields).reduce((memo, fieldName) => {
      let fieldValue = formData[fieldName];

      if (!this.validatedFields[fieldName].isValid(fieldValue)) {
        memo[fieldName] = this.validatedFields[fieldName].error;
      }

      return memo;
    }, {});

    return {errors, isValid: !Object.keys(errors).length};
  }

  render() {
    const errors = Object.keys(this.state.errors).map((errorID, index) => {
      return (
        <FormRow key={index}>
          <FormError>{this.state.errors[errorID]}</FormError>
        </FormRow>
      );
    });

    return (
      <Form
        className="inverse"
        onChange={this.handleFormChange}
        onSubmit={this.handleFormSubmit}
        ref={ref => (this.formRef = ref)}>
        <ModalFormSectionHeader>
          <FormattedMessage id="feeds.existing.feeds" defaultMessage="Existing Feeds" />
        </ModalFormSectionHeader>
        <FormRow>
          <FormRowItem>{this.getFeedsList()}</FormRowItem>
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="feeds.add.feed" defaultMessage="Add Feed" />
        </ModalFormSectionHeader>
        {errors}
        {this.getAddFeedForm()}
      </Form>
    );
  }
}

export default injectIntl(FeedsTab);
