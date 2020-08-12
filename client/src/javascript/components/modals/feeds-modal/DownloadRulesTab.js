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

import connectStores from '../../../util/connectStores';
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
  },
  mustSelectFeed: {
    id: 'feeds.validation.must.select.feed',
  },
  mustSpecifyLabel: {
    id: 'feeds.validation.must.specify.label',
  },
  invalidRegularExpression: {
    id: 'feeds.validation.invalid.regular.expression',
  },
  url: {
    id: 'feeds.url',
  },
  label: {
    id: 'feeds.label',
  },
  regEx: {
    id: 'feeds.regEx',
  },
  tags: {
    id: 'feeds.tags',
  },
  check: {
    id: 'feeds.check',
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
    currentlyEditingRule: null,
    doesPatternMatchTest: false,
  };

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
      isValid: (value) => validators.isNotEmpty(value) && validators.isRegExValid(value),
      error: this.props.intl.formatMessage(MESSAGES.invalidRegularExpression),
    },
    exclude: {
      isValid: (value) => {
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

    if (errors[fieldName] && this.validatedFields[fieldName].isValid(fieldValue)) {
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
    const {feeds} = this.props;

    if (feeds.length === 0) {
      return [
        <SelectItem key="empty" id="placeholder" placeholder>
          <em>
            <FormattedMessage id="feeds.no.feeds.available" />
          </em>
        </SelectItem>,
      ];
    }

    return feeds.reduce(
      (feedOptions, feed) =>
        feedOptions.concat(
          <SelectItem key={feed._id} id={feed._id}>
            {feed.label}
          </SelectItem>,
        ),
      [
        <SelectItem key="select-feed" id="placeholder" placeholder>
          <em>
            <FormattedMessage id="feeds.select.feed" />
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
            })}
            defaultValue={rule.label}
          />
          <Select
            disabled={!this.props.feeds.length}
            id="feedID"
            label={this.props.intl.formatMessage({
              id: 'feeds.applicable.feed',
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
            })}
            placeholder={this.props.intl.formatMessage(MESSAGES.regEx)}
            defaultValue={rule.match}
            width="three-eighths"
          />
          <Textbox
            id="exclude"
            label={this.props.intl.formatMessage({
              id: 'feeds.exclude.pattern',
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
              })}
              suggested={rule.destination}
            />
          </FormRowItem>
          <Textbox
            id="tags"
            label={this.props.intl.formatMessage({
              id: 'feeds.apply.tags',
            })}
            placeholder={this.props.intl.formatMessage(MESSAGES.tags)}
            defaultValue={rule.tags.join(', ')}
          />
        </FormRow>
        <FormRow>
          <FormRowItem width="auto" />
          <Checkbox id="startOnLoad" checked={rule.startOnLoad} matchTextboxHeight>
            <FormattedMessage id="feeds.start.on.load" />
          </Checkbox>
          <Button onClick={() => this.setState({currentlyEditingRule: null})}>
            <FormattedMessage id="button.cancel" />
          </Button>
          <Button type="submit">
            <FormattedMessage id="button.save.feed" />
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
          <FormattedMessage id="feeds.exclude" /> {rule.exclude}
        </li>
      );
    }

    if (rule.tags && rule.tags.length > 0) {
      const tagNodes = rule.tags.map((tag) => (
        <span className="tag" key={tag}>
          {tag}
        </span>
      ));

      tags = (
        <li className="interactive-list__detail-list__item interactive-list__detail interactive-list__detail--tertiary">
          <FormattedMessage id="feeds.tags" /> {tagNodes}
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
              <FormattedMessage id="feeds.match.count" values={{count: matchedCount}} />
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
              <FormattedMessage id="feeds.match" /> {rule.match}
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
    const {rules} = this.props;

    if (rules.length === 0) {
      return (
        <ul className="interactive-list">
          <li className="interactive-list__item">
            <FormattedMessage id="feeds.no.rules.defined" />
          </li>
        </ul>
      );
    }

    const rulesList = rules.map((rule) => this.getRulesListItem(rule));

    return <ul className="interactive-list">{rulesList}</ul>;
  }

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
    const errors = Object.keys(this.state.errors).map((errorID) => (
      <FormRow key={errorID}>
        <FormError>{this.state.errors[errorID]}</FormError>
      </FormRow>
    ));

    return (
      <Form
        className="inverse"
        onChange={this.handleFormChange}
        onSubmit={this.handleFormSubmit}
        ref={(ref) => {
          this.formRef = ref;
        }}>
        <ModalFormSectionHeader>
          <FormattedMessage id="feeds.existing.rules" />
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
              <FormattedMessage id="button.new" />
            </Button>
          </FormRow>
        )}
      </Form>
    );
  }
}

const ConnectedDownloadRulesTab = connectStores(injectIntl(DownloadRulesTab), () => {
  return [
    {
      store: FeedMonitorStore,
      event: EventTypes.SETTINGS_FEED_MONITORS_FETCH_SUCCESS,
      getValue: ({store}) => {
        return {
          feeds: store.getFeeds(),
          rules: store.getRules(),
        };
      },
    },
  ];
});

export default ConnectedDownloadRulesTab;
