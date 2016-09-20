import _ from 'lodash';
import {defineMessages, formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import AddMini from '../../Icons/AddMini';
import AuthStore from '../../../stores/AuthStore';
import Checkbox from '../../General/FormElements/Checkbox';
import Close from '../../Icons/Close';
import Dropdown from '../../General/FormElements/Dropdown';
import FeedMonitorStore from '../../../stores/FeedMonitorStore';
import FormColumn from '../../General/FormElements/FormColumn';
import FormLabel from '../../General/FormElements/FormLabel';
import formatUtil from '../../../../../shared/util/formatUtil';
import EventTypes from '../../../constants/EventTypes';
import RemoveMini from '../../Icons/RemoveMini';
import SettingsActions from '../../../actions/SettingsActions';
import TorrentDestination from '../../General/Filesystem/TorrentDestination';
import Validator from '../../../util/Validator';

const METHODS_TO_BIND = [
  'handleAddFeedClick',
  'handleFeedMonitorsFetchSuccess',
  'handleIntervalDropdownSelect',
  'handleRemoveFeedClick'
];

const MESSAGES = defineMessages({
  mustSpecifyURL: {
    id: 'feeds.validation.must.specify.valid.feed.url',
    defaultMessage: 'You must specify a valid feed URL.'
  },
  mustSpecifyLabel: {
    id: 'feeds.validation.must.specify.label',
    defaultMessage: 'You must specify a label.'
  },
  min: {
    id: 'feeds.time.min',
    defaultMessage: 'min'
  },
  hr: {
    id: 'feeds.time.hr',
    defaultMessage: 'hr'
  },
  url: {
    id: 'feeds.url',
    defaultMessage: 'URL'
  },
  label: {
    id: 'feeds.label',
    defaultMessage: 'Label'
  }
});

class FeedsTab extends React.Component {
  constructor() {
    super(...arguments);

    this.inputRefs = {};
    this.state = {
      addFeedsError: null,
      errors: {},
      intervals: [
        {
          displayName: `5 ${this.props.intl.formatMessage(MESSAGES.min)}`,
          selected: true,
          value: 5
        },
        {
          displayName: `15 ${this.props.intl.formatMessage(MESSAGES.min)}`,
          selected: false,
          value: 15
        },
        {
          displayName: `30 ${this.props.intl.formatMessage(MESSAGES.min)}`,
          selected: false,
          value: 30
        },
        {
          displayName: `5 ${this.props.intl.formatMessage(MESSAGES.hr)}`,
          selected: false,
          value: 60
        }
      ],
      feeds: FeedMonitorStore.getFeeds(),
      rules: FeedMonitorStore.getRules()
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.checkFieldValidity = _.throttle(this.checkFieldValidity, 150);

    this.validatedFields = {
      url: {
        isValid: Validator.isURLValid,
        error: this.props.intl.formatMessage(MESSAGES.mustSpecifyURL)
      },
      label: {
        isValid: Validator.isNotEmpty,
        error: this.props.intl.formatMessage(MESSAGES.mustSpecifyLabel)
      }
    };
  }

  componentDidMount() {
    FeedMonitorStore.listen(EventTypes.SETTINGS_FEED_MONITORS_FETCH_SUCCESS,
      this.handleFeedMonitorsFetchSuccess);
  }

  componentWillUnmount() {
    FeedMonitorStore.unlisten(EventTypes.SETTINGS_FEED_MONITORS_FETCH_SUCCESS,
      this.handleFeedMonitorsFetchSuccess);
  }

  checkFieldValidity(fieldName, fieldValue) {
    let {errors} = this.state;

    if (this.state.errors[fieldName]
      && this.validatedFields[fieldName].isValid(fieldValue)) {
      delete errors[fieldName];
      this.setState({errors});
    }
  }

  getIntervalDropdownHeader() {
    let dropdownText = null;
    let selectedInterval = this.getSelectedDropdownItem('intervals');

    if (selectedInterval) {
      dropdownText = selectedInterval.displayName;
    } else {
      dropdownText = this.props.intl.formatMessage({
        id: 'feeds.select.interval',
        defaultMessage: 'Select Interval'
      });
    }

    return (
      <a className="dropdown__button">
        <span className="dropdown__value">{dropdownText}</span>
      </a>
    );
  }

  getFeedFields() {
    let {errors} = this.state;

    return [
      <div className="form__row" key="feed-row-1">
        <FormColumn error={errors.url}>
          <FormLabel error={errors.url}>
            <FormattedMessage id="feeds.url"
              defaultMessage="URL" />
          </FormLabel>
          <input className="textbox"
            onChange={this.handleFieldInput.bind(this, 'url')}
            placeholder={this.props.intl.formatMessage(MESSAGES.url)}
            ref={ref => this.inputRefs.feedURL = ref} type="text" />
        </FormColumn>
        <FormColumn modifiers={['auto']}>
          <FormLabel>
            <FormattedMessage id="feeds.interval"
              defaultMessage="Interval" />
          </FormLabel>
          <Dropdown
            handleItemSelect={this.handleIntervalDropdownSelect}
            header={this.getIntervalDropdownHeader()}
            menuItems={[this.state.intervals]}
            width="small" />
        </FormColumn>
      </div>,
      <div className="form__row" key="feed-row-2">
        <FormColumn error={errors.label}>
          <FormLabel error={errors.label}>
            <FormattedMessage id="feeds.label"
              defaultMessage="Label" />
          </FormLabel>
          <input className="textbox"
            onChange={this.handleFieldInput.bind(this, 'label')}
            placeholder={this.props.intl.formatMessage(MESSAGES.label)}
            ref={ref => this.inputRefs.feedLabel = ref}
            type="text" />
        </FormColumn>
        <FormColumn modifiers={['auto']}>
          <button className="button button--primary"
            onClick={this.handleAddFeedClick}>
            <FormattedMessage id="button.add"
              defaultMessage="Add" />
          </button>
        </FormColumn>
      </div>
    ];
  }

  getFeedsList() {
    if (this.state.feeds.length === 0) {
      return <em><FormattedMessage id="feeds.no.feeds.defined"
                  defaultMessage="No feeds defined." /></em>;
    }

    let feedsList = this.state.feeds.map((feed, index) => {
      let matchedCount = feed.count || 0;

      return (
        <li className="interactive-list__item feed-list__feed" key={feed._id}>
          <div className="interactive-list__label">
            <ul className="interactive-list__detail-list">
              <li className="interactive-list__detail-list__item
                interactive-list__detail--primary">
                {feed.label}
              </li>
              <li className="interactive-list__detail-list__item
                interactive-list__detail-list__item--overflow
                interactive-list__detail interactive-list__detail--secondary">
                <FormattedMessage id="feeds.match.count"
                  defaultMessage="{count, plural, =1 {# match} other
                    {# matches}}" values={{count: matchedCount}} />
              </li>
            </ul>
            <ul className="interactive-list__detail-list">
              <li className="interactive-list__detail-list__item
                interactive-list__detail interactive-list__detail--tertiary">
                {formatUtil.minToHumanReadable(feed.interval)}
              </li>
              <li className="interactive-list__detail-list__item
                interactive-list__detail-list__item--overflow
                interactive-list__detail interactive-list__detail--tertiary">
                <a href={feed.url} target="_blank">{feed.url}</a>
              </li>
            </ul>
          </div>
          <div className="interactive-list__icon
            interactive-list__icon--action"
            onClick={this.handleRemoveFeedClick.bind(this, feed)}>
            <Close />
          </div>
        </li>
      );
    });

    return (
      <ul className="interactive-list feed-list">
        {feedsList}
      </ul>
    );
  }

  getSelectedDropdownItem(itemSet) {
    return this.state[itemSet].find((item) => {
      return item.selected;
    });
  }

  handleAddFeedClick() {
    let {errors, formData, isValid} = this.validateForm();

    if (!isValid) {
      this.setState({errors});
    } else {
      FeedMonitorStore.addFeed(formData);
      this.resetFormFields();
    }
  }

  handleFieldInput(fieldName, event) {
    this.checkFieldValidity(fieldName, event.target.value);
  }

  handleFeedMonitorsFetchSuccess() {
    this.setState({
      feeds: FeedMonitorStore.getFeeds(),
      rules: FeedMonitorStore.getRules()
    });
  }

  handleIntervalDropdownSelect(selectedInterval) {
    this.setState({
      intervals: this.state.intervals.map((interval) => {
        return {
          ...interval,
          selected: selectedInterval.value === interval.value
        };
      })
    });
  }

  handleRemoveFeedClick(feed) {
    FeedMonitorStore.removeFeed(feed._id);
  }

  resetFormFields() {
    let {inputRefs = {}} = this;

    Object.keys(inputRefs).forEach((fieldName) => {
      this.inputRefs[fieldName].value = '';
    });
  }

  validateForm() {
    let isValid = true;
    let selectedInterval = this.getSelectedDropdownItem('intervals');

    let formData = {
      interval: selectedInterval.value,
      label: this.inputRefs.feedLabel.value,
      url: this.inputRefs.feedURL.value
    };

    let errors = Object.keys(this.validatedFields).reduce((memo, fieldName) => {
      let fieldValue = formData[fieldName];

      if (!this.validatedFields[fieldName].isValid(fieldValue)) {
        memo[fieldName] = this.validatedFields[fieldName].error;
        isValid = false;
      }

      return memo;
    }, {});

    return {errors, isValid, formData};
  }

  render() {
    let error = null;

    if (this.state.addFeedsError) {
      error = (
        <div className="form__row">
          <FormColumn>
            {this.state.addFeedsError}
          </FormColumn>
        </div>
      );
    }

    return (
      <div className="form">
        <div className="form__section">
          <div className="form__section__heading">
            <FormattedMessage id="feeds.existing.feeds"
              defaultMessage="Existing Feeds" />
          </div>
          <div className="form__row">
            <FormColumn>
              {this.getFeedsList()}
            </FormColumn>
          </div>
        </div>
        <div className="form__section">
          <div className="form__section__heading">
            <FormattedMessage id="feeds.add.feed"
              defaultMessage="Add Feed" />
          </div>
          {this.getFeedFields()}
          {error}
        </div>
      </div>
    );
  }
}

export default injectIntl(FeedsTab);
