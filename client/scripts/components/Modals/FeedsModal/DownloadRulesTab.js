import _ from 'lodash';
import {defineMessages, formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import AddMini from '../../Icons/AddMini';
import AuthStore from '../../../stores/AuthStore';
import Checkbox from '../../General/FormElements/Checkbox';
import Close from '../../Icons/Close';
import Dropdown from '../../General/FormElements/Dropdown';
import EventTypes from '../../../constants/EventTypes';
import FeedMonitorStore from '../../../stores/FeedMonitorStore';
import FormColumn from '../../General/FormElements/FormColumn';
import FormLabel from '../../General/FormElements/FormLabel';
import RemoveMini from '../../Icons/RemoveMini';
import SettingsActions from '../../../actions/SettingsActions';
import TorrentDestination from '../../General/Filesystem/TorrentDestination';
import Validator from '../../../util/Validator';

const MESSAGES = defineMessages({
  mustSpecifyDestination: {
    id: 'feeds.validation.must.specify.destination',
    defaultMessage: 'You must specify a destination.'
  },
  mustSelectFeed: {
    id: 'feeds.validation.must.select.feed',
    defaultMessage: 'You must select a feed.'
  },
  mustSpecifyLabel: {
    id: 'feeds.validation.must.specify.label',
    defaultMessage: 'You must specify a label.'
  },
  invalidRegularExpression: {
    id: 'feeds.validation.invalid.regular.expression',
    defaultMessage: 'Invalid regular expression.'
  },
  url: {
    id: 'feeds.url',
    defaultMessage: 'URL'
  },
  label: {
    id: 'feeds.label',
    defaultMessage: 'Label'
  },
  regEx: {
    id: 'feeds.regEx',
    defaultMessage: 'RegEx'
  },
  tags: {
    id: 'feeds.tags',
    defaultMessage: 'Tags'
  }
});

const METHODS_TO_BIND = [
  'handleAddRuleClick',
  'handleFeedMonitorsFetchSuccess',
  'handleFeedDropdownSelect'
];

class DownloadRulesTab extends React.Component {
  constructor() {
    super(...arguments);

    this.inputRefs = {};
    this.state = {
      addRuleError: null,
      errors: {},
      feeds: FeedMonitorStore.getFeeds(),
      rules: FeedMonitorStore.getRules()
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.checkFieldValidity = _.throttle(this.checkFieldValidity, 150);

    this.validatedFields = {
      destination: {
        isValid: Validator.isNotEmpty,
        error: this.props.intl.formatMessage(MESSAGES.mustSpecifyDestination)
      },
      feedID: {
        isValid: Validator.isNotEmpty,
        error: this.props.intl.formatMessage(MESSAGES.mustSelectFeed)
      },
      label: {
        isValid: Validator.isNotEmpty,
        error: this.props.intl.formatMessage(MESSAGES.mustSpecifyLabel)
      },
      match: {
        isValid: (value) => {
          return Validator.isNotEmpty(value) && Validator.isRegExValid(value);
        },
        error: this.props.intl.formatMessage(MESSAGES.invalidRegularExpression)
      },
      exclude: {
        isValid: (value) => {
          if (Validator.isNotEmpty(value)) {
            return Validator.isRegExValid(value);
          }

          return true;
        },
        error: this.props.intl.formatMessage(MESSAGES.invalidRegularExpression)
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

  getRuleFields() {
    let {errors} = this.state;

    return [
      <div className="form__row" key="rule-row-1">
        <FormColumn error={errors.label}>
          <FormLabel error={errors.label}>
            <FormattedMessage id="feeds.label"
              defaultMessage="Label" />
          </FormLabel>
          <input className="textbox"
            onChange={this.handleFieldInput.bind(this, 'label')}
            placeholder={this.props.intl.formatMessage(MESSAGES.label)}
            ref={ref => this.inputRefs.ruleLabel = ref}
            type="text" />
        </FormColumn>
        <FormColumn error={errors.feedID} modifiers={['fourth']}>
          <FormLabel error={errors.feedID}>
            <FormattedMessage id="feeds.applicable.feed"
              defaultMessage="Applicable Feed" />
          </FormLabel>
          {this.getAvailableFeedsDropdown()}
        </FormColumn>
      </div>,
      <div className="form__row" key="rule-row-2">
        <FormColumn error={errors.match}>
          <FormLabel error={errors.match}>
            <FormattedMessage id="feeds.match.pattern"
              defaultMessage="Match Pattern" />
          </FormLabel>
          <input className="textbox"
            onChange={this.handleFieldInput.bind(this, 'match')}
            placeholder={this.props.intl.formatMessage(MESSAGES.regEx)}
            ref={ref => this.inputRefs.ruleMatch = ref} type="text" />
        </FormColumn>
        <FormColumn error={errors.exclude}>
          <FormLabel error={errors.exclude}>
            <FormattedMessage id="feeds.exclude.pattern"
              defaultMessage="Exclude Pattern" />
          </FormLabel>
          <input className="textbox"
            onChange={this.handleFieldInput.bind(this, 'exclude')}
            placeholder={this.props.intl.formatMessage(MESSAGES.regEx)}
            ref={ref => this.inputRefs.ruleExclude = ref} type="text" />
        </FormColumn>
        <FormColumn>
          <FormLabel>
            <FormattedMessage id="feeds.apply.tags"
              defaultMessage="Apply Tags" />
          </FormLabel>
          <input className="textbox"
            placeholder={this.props.intl.formatMessage(MESSAGES.tags)}
            ref={ref => this.inputRefs.tags = ref} type="text" />
        </FormColumn>
      </div>,
      <div className="form__row" key="rule-row-3">
        <FormColumn error={errors.destination}>
          <FormLabel error={errors.destination}>
            <FormattedMessage id="feeds.torrent.destination"
              defaultMessage="Torrent Destination" />
          </FormLabel>
          <TorrentDestination
            onChange={this.checkFieldValidity.bind(this, 'destination')}
            ref={ref => this.inputRefs.ruleDestination = ref} />
        </FormColumn>
        <FormColumn modifiers={['auto', 'unlabled']}>
          <Checkbox ref={ref => this.inputRefs.startOnLoad = ref}>
            <FormattedMessage id="feeds.start.on.load"
              defaultMessage="Start on load" />
          </Checkbox>
        </FormColumn>
        <FormColumn modifiers={['auto', 'unlabled']}>
          <button className="button button--primary"
            onClick={this.handleAddRuleClick}>
            <FormattedMessage id="button.add"
              defaultMessage="Add" />
          </button>
        </FormColumn>
      </div>
    ];
  }

  getAvailableFeedsDropdown() {
    let dropdownItems = this.state.feeds.map((feed) => {
      return {
        ...feed,
        displayName: feed.label
      };
    });

    if (dropdownItems.length === 0) {
      dropdownItems = [{
        displayName: (
          <em>
            <FormattedMessage id="feeds.no.feeds.available"
              defaultMessage="No feeds available." />
          </em>
        ),
        selectable: false
      }];
    }

    return (
      <Dropdown handleItemSelect={this.handleFeedDropdownSelect}
        header={this.getAvailableFeedsDropdownHeader()}
        matchButtonWidth={true}
        menuItems={[dropdownItems]}
        noWrap={true} />
    );
  }

  getAvailableFeedsDropdownHeader() {
    let dropdownText = null;
    let selectedFeed = this.getSelectedDropdownItem('feeds');

    if (selectedFeed) {
      dropdownText = selectedFeed.label;
    } else {
      dropdownText = this.props.intl.formatMessage({
        id: 'feeds.select.feed',
        defaultMessage: 'Select Feed'
      });
    }

    return (
      <a className="dropdown__button">
        <span className="dropdown__value">{dropdownText}</span>
      </a>
    );
  }

  getFeedField() {
    return 'title';
  }

  handleFieldInput(fieldName, event) {
    this.checkFieldValidity(fieldName, event.target.value);
  }

  getRulesList() {
    if (this.state.rules.length === 0) {
      return (
        <em>
          <FormattedMessage id="feeds.no.rules.defined"
            defaultMessage="No rules defined." />
        </em>
      );
    }

    let rulesList = this.state.rules.map((rule, index) => {
      let matchedCount = rule.count || 0;
      let excludeNode = null;
      let tags = null;

      if (rule.exclude) {
        excludeNode = (
          <li className="interactive-list__detail-list__item
            interactive-list__detail interactive-list__detail--tertiary">
            {rule.exclude}
          </li>
        );
      }

      if (rule.tags && rule.tags.length > 0) {
        let tagNodes = rule.tags.map((tag, index) => {
          return <span className="tag" key={index}>{tag}</span>;
        });

        tags = (
          <li className="interactive-list__detail-list__item
            interactive-list__detail interactive-list__detail--tertiary">
            <FormattedMessage id="feeds.tags"
              defaultMessage="Tags" /> {tagNodes}
          </li>
        );
      }

      return (
        <li className="interactive-list__item" key={rule._id}>
          <div className="interactive-list__label">
            <ul className="interactive-list__detail-list">
              <li className="interactive-list__detail-list__item
                interactive-list__detail--primary">
                {rule.label}
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
                <FormattedMessage id="feeds.match"
                  defaultMessage="Match" /> {rule.match}
              </li>
              {excludeNode}
              {tags}
            </ul>
          </div>
          <div className="interactive-list__icon
            interactive-list__icon--action"
            onClick={this.handleRemoveRuleClick.bind(this, rule)}>
            <Close />
          </div>
        </li>
      );
    });

    return (
      <ul className="interactive-list">
        {rulesList}
      </ul>
    );
  }

  getSelectedDropdownItem(itemSet) {
    return this.state[itemSet].find((item) => {
      return item.selected;
    });
  }

  handleAddRuleClick() {
    let {errors, formData, isValid} = this.validateForm();

    if (!isValid) {
      this.setState({errors});
    } else {
      FeedMonitorStore.addRule(formData);
      this.resetFormFields();
    }
  }

  handleFeedMonitorsFetchSuccess() {
    this.setState({
      feeds: FeedMonitorStore.getFeeds(),
      rules: FeedMonitorStore.getRules()
    });
  }

  handleFeedDropdownSelect(selectedFeed) {
    this.setState({
      feeds: this.state.feeds.map((feed) => {
        return {
          ...feed,
          selected: selectedFeed._id === feed._id
        };
      })
    }, () => {
      this.checkFieldValidity('feedID', selectedFeed._id);
    });
  }

  handleRemoveRuleClick(rule) {
    FeedMonitorStore.removeRule(rule._id);
  }

  resetFormFields() {
    let {inputRefs = {}} = this;

    Object.keys(inputRefs).forEach((fieldName) => {
      this.inputRefs[fieldName].value = '';
    });
  }

  validateForm() {
    let feedID = null;
    let isValid = true;
    let selectedFeed = this.getSelectedDropdownItem('feeds');

    if (!!selectedFeed) {
      feedID = selectedFeed._id;
    }

    let formData = {
      destination: this.inputRefs.ruleDestination.refs.wrappedInstance
        .getValue(),
      exclude: this.inputRefs.ruleExclude.value,
      field: this.getFeedField(),
      feedID,
      label: this.inputRefs.ruleLabel.value,
      match: this.inputRefs.ruleMatch.value,
      startOnLoad: this.inputRefs.startOnLoad.getValue(),
      tags: this.inputRefs.tags.value.split(',')
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

    if (this.state.addRuleError) {
      error = (
        <div className="form__row">
          <FormColumn>
            {this.state.addRuleError}
          </FormColumn>
        </div>
      );
    }

    return (
      <div className="form">
        <div className="form__section">
          <div className="form__section__heading">
            <FormattedMessage id="feeds.existing.rules"
              defaultMessage="Existing Rules" />
          </div>
          <div className="form__row">
            <FormColumn>
              {this.getRulesList()}
            </FormColumn>
          </div>
        </div>
        <div className="form__section">
          <div className="form__section__heading">
            <FormattedMessage id="feeds.add.automatic.download.rule"
              defaultMessage="Add Download Rule" />
          </div>
          {this.getRuleFields()}
          {error}
        </div>
      </div>
    );
  }
}

export default injectIntl(DownloadRulesTab);
