import _ from 'lodash';
import {
  Button,
  Checkbox,
  Form,
  FormElementAddon,
  FormError,
  FormRow,
  FormRowGroup,
  FormRowItem,
  Select,
  SelectItem,
  Textbox,
} from 'flood-ui-kit';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import Edit from '../../icons/Edit';
import Checkmark from '../../icons/Checkmark';
import Close from '../../icons/Close';
import EventTypes from '../../../constants/EventTypes';
import FeedMonitorStore from '../../../stores/FeedMonitorStore';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import TorrentDestination from '../../general/filesystem/TorrentDestination';
import * as validators from '../../../util/validators';

const MESSAGES = defineMessages({
  mustSpecifyDestination: {
    id: 'feeds.validation.must.specify.destination',
    defaultMessage: 'You must specify a destination.',
  },
  mustSelectFeed: {
    id: 'feeds.validation.must.select.feed',
    defaultMessage: 'You must select a feed.',
  },
  mustSpecifyLabel: {
    id: 'feeds.validation.must.specify.label',
    defaultMessage: 'You must specify a label.',
  },
  invalidRegularExpression: {
    id: 'feeds.validation.invalid.regular.expression',
    defaultMessage: 'Invalid regular expression.',
  },
  url: {
    id: 'feeds.url',
    defaultMessage: 'URL',
  },
  label: {
    id: 'feeds.label',
    defaultMessage: 'Label',
  },
  regEx: {
    id: 'feeds.regEx',
    defaultMessage: 'RegEx',
  },
  tags: {
    id: 'feeds.tags',
    defaultMessage: 'Tags',
  },
  check: {
    id: 'feeds.check',
    defaultMessage: 'Test Match Pattern',
  },
});

const defaultRule = {
  label: '',
  feedID: '',
  match: '',
  exclude: '',
  tags: [],
  destination: '',
  startOnLoad: false,
};

class DownloadRulesTab extends React.Component {
  state = {
    errors: {},
    feeds: FeedMonitorStore.getFeeds(),
    rules: FeedMonitorStore.getRules(),
    currentlyEditingRule: null,
    doesPatternMatchTest: false,
  };

  componentDidMount() {
    FeedMonitorStore.listen(EventTypes.SETTINGS_FEED_MONITORS_FETCH_SUCCESS, this.handleFeedMonitorsFetchSuccess);
  }

  componentWillUnmount() {
    FeedMonitorStore.unlisten(EventTypes.SETTINGS_FEED_MONITORS_FETCH_SUCCESS, this.handleFeedMonitorsFetchSuccess);
  }

  validatedFields = {
    destination: {
      isValid: validators.isNotEmpty,
      error: this.props.intl.formatMessage(MESSAGES.mustSpecifyDestination),
    },
    feedID: {
      isValid: validators.isNotEmpty,
      error: this.props.intl.formatMessage(MESSAGES.mustSelectFeed),
    },
    label: {
      isValid: validators.isNotEmpty,
      error: this.props.intl.formatMessage(MESSAGES.mustSpecifyLabel),
    },
    match: {
      isValid: value => validators.isNotEmpty(value) && validators.isRegExValid(value),
      error: this.props.intl.formatMessage(MESSAGES.invalidRegularExpression),
    },
    exclude: {
      isValid: value => {
        if (validators.isNotEmpty(value)) {
          return validators.isRegExValid(value);
        }

        return true;
      },
      error: this.props.intl.formatMessage(MESSAGES.invalidRegularExpression),
    },
  };

  formRef = null;

  checkFieldValidity = _.throttle((fieldName, fieldValue) => {
    const {errors} = this.state;

    if (this.state.errors[fieldName] && this.validatedFields[fieldName].isValid(fieldValue)) {
      delete errors[fieldName];
      this.setState({errors});
    }
  }, 150);

  checkMatchingPattern(match, exclude, check) {
    let doesPatternMatchTest = false;

    if (validators.isNotEmpty(check) && validators.isRegExValid(match) && validators.isRegExValid(exclude)) {
      const isMatched = new RegExp(match, 'gi').test(check);
      const isExcluded = exclude !== '' && new RegExp(exclude, 'gi').test(check);
      doesPatternMatchTest = isMatched && !isExcluded;
    }

    this.setState({doesPatternMatchTest});
  }

  getAmendedFormData() {
    const formData = this.formRef.getFormData();
    delete formData.check;

    return Object.assign({}, formData, {
      field: 'title',
      tags: formData.tags.split(','),
    });
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

  getModifyRuleForm(rule) {
    const {doesPatternMatchTest, currentlyEditingRule} = this.state;

    return (
      <FormRowGroup key={currentlyEditingRule == null ? 'default' : currentlyEditingRule._id}>
        <FormRow>
          <Textbox
            id="label"
            label={this.props.intl.formatMessage({
              id: 'feeds.label',
              defaultMessage: 'Label',
            })}
            defaultValue={rule.label}
          />
          <Select
            disabled={!this.state.feeds.length}
            id="feedID"
            label={this.props.intl.formatMessage({
              id: 'feeds.applicable.feed',
              defaultMessage: 'Applicable Feed',
            })}
            defaultID={rule.feedID}>
            {this.getAvailableFeedsOptions()}
          </Select>
        </FormRow>
        <FormRow>
          <Textbox
            id="match"
            label={this.props.intl.formatMessage({
              id: 'feeds.match.pattern',
              defaultMessage: 'Match Pattern',
            })}
            placeholder={this.props.intl.formatMessage(MESSAGES.regEx)}
            defaultValue={rule.match}
            width="three-eighths"
          />
          <Textbox
            id="exclude"
            label={this.props.intl.formatMessage({
              id: 'feeds.exclude.pattern',
              defaultMessage: 'Exclude Pattern',
            })}
            placeholder={this.props.intl.formatMessage(MESSAGES.regEx)}
            defaultValue={rule.exclude}
            width="three-eighths"
          />
          <Textbox
            addonPlacement="after"
            id="check"
            label={this.props.intl.formatMessage({
              id: 'feeds.test.match',
              defaultMessage: 'Test Match Pattern',
            })}
            placeholder={this.props.intl.formatMessage(MESSAGES.check)}>
            {doesPatternMatchTest && (
              <FormElementAddon>
                <Checkmark />
              </FormElementAddon>
            )}
          </Textbox>
        </FormRow>
        <FormRow>
          <FormRowItem>
            <TorrentDestination
              id="destination"
              label={this.props.intl.formatMessage({
                id: 'feeds.torrent.destination',
                defaultMessage: 'Torrent Destination',
              })}
              suggested={rule.destination}
            />
          </FormRowItem>
          <Textbox
            id="tags"
            label={this.props.intl.formatMessage({
              id: 'feeds.apply.tags',
              defaultMessage: 'Apply Tags',
            })}
            placeholder={this.props.intl.formatMessage(MESSAGES.tags)}
            defaultValue={rule.tags.join(', ')}
          />
        </FormRow>
        <FormRow>
          <FormRowItem width="auto" />
          <Checkbox id="startOnLoad" checked={rule.startOnLoad} matchTextboxHeight>
            <FormattedMessage id="feeds.start.on.load" defaultMessage="Start on load" />
          </Checkbox>
          <Button onClick={() => this.setState({currentlyEditingRule: null})}>
            <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
          </Button>
          <Button type="submit">
            <FormattedMessage id="button.save.feed" defaultMessage="Save" />
          </Button>
        </FormRow>
      </FormRowGroup>
    );
  }

  getRulesListItem(rule) {
    const matchedCount = rule.count || 0;
    let excludeNode = null;
    let tags = null;

    if (rule.exclude) {
      excludeNode = (
        <li
          className="interactive-list__detail-list__item
          interactive-list__detail interactive-list__detail--tertiary">
          <FormattedMessage id="feeds.exclude" defaultMessage="Exclude" /> {rule.exclude}
        </li>
      );
    }

    if (rule.tags && rule.tags.length > 0) {
      const tagNodes = rule.tags.map(tag => (
        <span className="tag" key={tag}>
          {tag}
        </span>
      ));

      tags = (
        <li className="interactive-list__detail-list__item interactive-list__detail interactive-list__detail--tertiary">
          <FormattedMessage id="feeds.tags" defaultMessage="Tags" /> {tagNodes}
        </li>
      );
    }

    return (
      <li className="interactive-list__item interactive-list__item--stacked-content" key={rule._id}>
        <div className="interactive-list__label">
          <ul className="interactive-list__detail-list">
            <li
              className="interactive-list__detail-list__item
              interactive-list__detail--primary">
              {rule.label}
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
            {rule === this.state.currentlyEditingRule && (
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
              <FormattedMessage id="feeds.match" defaultMessage="Match" /> {rule.match}
            </li>
            {excludeNode}
            {tags}
          </ul>
        </div>
        <span
          className="interactive-list__icon interactive-list__icon--action"
          onClick={() => this.handleModifyRuleClick(rule)}>
          <Edit />
        </span>
        <span
          className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
          onClick={() => this.handleRemoveRuleClick(rule)}>
          <Close />
        </span>
      </li>
    );
  }

  getRulesList() {
    if (this.state.rules.length === 0) {
      return (
        <ul className="interactive-list">
          <li className="interactive-list__item">
            <FormattedMessage defaultMessage="No ruless defined." id="rules.no.rules.defined" />
          </li>
        </ul>
      );
    }

    const rulesList = this.state.rules.map(rule => this.getRulesListItem(rule));

    return <ul className="interactive-list">{rulesList}</ul>;
  }

  handleFeedMonitorsFetchSuccess = () => {
    this.setState({
      feeds: FeedMonitorStore.getFeeds(),
      rules: FeedMonitorStore.getRules(),
    });
  };

  handleFormChange = ({event, formData}) => {
    this.checkFieldValidity(event.target.name, formData[event.target.name]);
    this.checkMatchingPattern(formData.match, formData.exclude, formData.check);
  };

  handleFormSubmit = () => {
    const {errors, isValid} = this.validateForm();

    if (!isValid) {
      this.setState({errors});
    } else {
      const currentRule = this.state.currentlyEditingRule;
      const formData = this.getAmendedFormData();

      if (currentRule !== null && currentRule !== defaultRule) {
        FeedMonitorStore.removeRule(currentRule._id);
      }
      FeedMonitorStore.addRule(formData);
      this.formRef.resetForm();
      this.setState({currentlyEditingRule: null});
    }
  };

  handleRemoveRuleClick(rule) {
    FeedMonitorStore.removeRule(rule._id);

    if (rule === this.state.currentlyEditingRule) {
      this.setState({currentlyEditingRule: null});
    }
  }

  handleAddRuleClick = () => {
    this.setState({currentlyEditingRule: defaultRule});
  };

  handleModifyRuleClick(rule) {
    this.setState({currentlyEditingRule: rule});
  }

  validateForm() {
    const formData = this.getAmendedFormData();

    const errors = Object.keys(this.validatedFields).reduce((accumulator, fieldName) => {
      const fieldValue = formData[fieldName];

      if (!this.validatedFields[fieldName].isValid(fieldValue)) {
        accumulator[fieldName] = this.validatedFields[fieldName].error;
      }

      return accumulator;
    }, {});

    return {errors, isValid: !Object.keys(errors).length};
  }

  render() {
    const errors = Object.keys(this.state.errors).map(errorID => (
      <FormRow key={errorID}>
        <FormError>{this.state.errors[errorID]}</FormError>
      </FormRow>
    ));

    return (
      <Form
        className="inverse"
        onChange={this.handleFormChange}
        onSubmit={this.handleFormSubmit}
        ref={ref => {
          this.formRef = ref;
        }}>
        <ModalFormSectionHeader>
          <FormattedMessage id="feeds.existing.rules" defaultMessage="Existing Rules" />
        </ModalFormSectionHeader>
        {errors}
        <FormRow>
          <FormRowItem>{this.getRulesList()}</FormRowItem>
        </FormRow>
        {this.state.currentlyEditingRule ? (
          this.getModifyRuleForm(this.state.currentlyEditingRule)
        ) : (
          <FormRow>
            <FormRowItem width="auto" />
            <Button onClick={this.handleAddRuleClick}>
              <FormattedMessage id="button.new" defaultMessage="New" />
            </Button>
          </FormRow>
        )}
      </Form>
    );
  }
}

export default injectIntl(DownloadRulesTab);
