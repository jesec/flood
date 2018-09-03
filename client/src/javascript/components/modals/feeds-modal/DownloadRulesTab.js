import _ from 'lodash';
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
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import Close from '../../icons/Close';
import EventTypes from '../../../constants/EventTypes';
import FeedMonitorStore from '../../../stores/FeedMonitorStore';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import TorrentDestination from '../../general/filesystem/TorrentDestination';
import Validator from '../../../util/Validator';

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
});

class DownloadRulesTab extends React.Component {
  validatedFields = {
    destination: {
      isValid: Validator.isNotEmpty,
      error: this.props.intl.formatMessage(MESSAGES.mustSpecifyDestination),
    },
    feedID: {
      isValid: Validator.isNotEmpty,
      error: this.props.intl.formatMessage(MESSAGES.mustSelectFeed),
    },
    label: {
      isValid: Validator.isNotEmpty,
      error: this.props.intl.formatMessage(MESSAGES.mustSpecifyLabel),
    },
    match: {
      isValid: value => {
        return Validator.isNotEmpty(value) && Validator.isRegExValid(value);
      },
      error: this.props.intl.formatMessage(MESSAGES.invalidRegularExpression),
    },
    exclude: {
      isValid: value => {
        if (Validator.isNotEmpty(value)) {
          return Validator.isRegExValid(value);
        }

        return true;
      },
      error: this.props.intl.formatMessage(MESSAGES.invalidRegularExpression),
    },
  };

  state = {
    errors: {},
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

  getAmendedFormData() {
    const formData = this.formRef.getFormData();

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
      (feedOptions, feed) => {
        return feedOptions.concat(
          <SelectItem key={feed._id} id={feed._id}>
            {feed.label}
          </SelectItem>
        );
      },
      [
        <SelectItem key="select-feed" id="placeholder" placeholder>
          <em>
            <FormattedMessage id="feeds.select.feed" defaultMessage="Select feed" />
          </em>
        </SelectItem>,
      ]
    );
  }

  getRuleFields() {
    const errors = Object.keys(this.state.errors).map((errorID, index) => {
      return (
        <FormRow key={index}>
          <FormError>{this.state.errors[errorID]}</FormError>
        </FormRow>
      );
    });

    return (
      <FormRowGroup>
        {errors}
        <FormRow>
          <Textbox
            id="label"
            label={this.props.intl.formatMessage({
              id: 'feeds.label',
              defaultMessage: 'Label',
            })}
          />
          <Select
            disabled={!this.state.feeds.length}
            id="feedID"
            label={this.props.intl.formatMessage({
              id: 'feeds.applicable.feed',
              defaultMessage: 'Applicable Feed',
            })}>
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
          />
          <Textbox
            id="exclude"
            label={this.props.intl.formatMessage({
              id: 'feeds.exclude.pattern',
              defaultMessage: 'Exclude Pattern',
            })}
            placeholder={this.props.intl.formatMessage(MESSAGES.regEx)}
          />
          <Textbox
            id="tags"
            label={this.props.intl.formatMessage({
              id: 'feeds.apply.tags',
              defaultMessage: 'Apply Tags',
            })}
            placeholder={this.props.intl.formatMessage(MESSAGES.tags)}
          />
        </FormRow>
        <TorrentDestination
          id="destination"
          label={this.props.intl.formatMessage({
            id: 'feeds.torrent.destination',
            defaultMessage: 'Torrent Destination',
          })}
        />
        <FormRow>
          <FormRowItem width="auto" />
          <Checkbox id="startOnLoad" matchTextboxHeight>
            <FormattedMessage id="feeds.start.on.load" defaultMessage="Start on load" />
          </Checkbox>
          <Button type="submit">
            <FormattedMessage id="button.add" defaultMessage="Add" />
          </Button>
        </FormRow>
      </FormRowGroup>
    );
  }

  getRulesList() {
    if (this.state.rules.length === 0) {
      return (
        <ul className="interactive-list">
          <li className="interactive-list__item">
            <FormattedMessage id="feeds.no.rules.defined" defaultMessage="No rules defined." />
          </li>
        </ul>
      );
    }

    const rulesList = this.state.rules.map((rule, index) => {
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
        const tagNodes = rule.tags.map((tag, index) => {
          return (
            <span className="tag" key={index}>
              {tag}
            </span>
          );
        });

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
            className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
            onClick={() => this.handleRemoveRuleClick(rule)}>
            <Close />
          </span>
        </li>
      );
    });

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
  };

  handleFormSubmit = () => {
    const {errors, isValid} = this.validateForm();
    const formData = this.getAmendedFormData();

    if (!isValid) {
      this.setState({errors});
    } else {
      FeedMonitorStore.addRule(formData);
      this.formRef.resetForm();
    }
  };

  handleRemoveRuleClick(rule) {
    FeedMonitorStore.removeRule(rule._id);
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
    return (
      <Form
        className="inverse"
        onChange={this.handleFormChange}
        onSubmit={this.handleFormSubmit}
        ref={ref => (this.formRef = ref)}>
        <ModalFormSectionHeader>
          <FormattedMessage id="feeds.existing.rules" defaultMessage="Existing Rules" />
        </ModalFormSectionHeader>
        <FormRow>
          <FormRowItem>{this.getRulesList()}</FormRowItem>
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="feeds.add.automatic.download.rule" defaultMessage="Add Download Rule" />
        </ModalFormSectionHeader>
        {this.getRuleFields()}
      </Form>
    );
  }
}

export default injectIntl(DownloadRulesTab);
