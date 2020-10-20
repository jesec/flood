import {defineMessages, FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';
import throttle from 'lodash/throttle';

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
} from '../../../ui';
import connectStores from '../../../util/connectStores';
import Edit from '../../icons/Edit';
import Checkmark from '../../icons/Checkmark';
import Close from '../../icons/Close';
import FeedsStore, {FeedsStoreClass} from '../../../stores/FeedsStore';
import FilesystemBrowserTextbox from '../../general/filesystem/FilesystemBrowserTextbox';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import TagSelect from '../../general/form-elements/TagSelect';
import * as validators from '../../../util/validators';

import type {Feeds, Rule, Rules} from '../../../stores/FeedsStore';

type ValidatedFields = 'destination' | 'feedID' | 'label' | 'match' | 'exclude';

interface RuleFormData extends Omit<Rule, 'tags'> {
  check: string;
  tags: string;
}

interface DownloadRulesTabProps extends WrappedComponentProps {
  feeds: Feeds;
  rules: Rules;
}

interface DownloadRulesTabStates {
  errors?: {
    [field in ValidatedFields]?: string;
  };
  currentlyEditingRule: Rule | null;
  doesPatternMatchTest: boolean;
}

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

class DownloadRulesTab extends React.Component<DownloadRulesTabProps, DownloadRulesTabStates> {
  formRef: Form | null = null;

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
      isValid: (value: string) => validators.isNotEmpty(value) && validators.isRegExValid(value),
      error: this.props.intl.formatMessage(MESSAGES.invalidRegularExpression),
    },
    exclude: {
      isValid: (value: string) => {
        if (validators.isNotEmpty(value)) {
          return validators.isRegExValid(value);
        }

        return true;
      },
      error: this.props.intl.formatMessage(MESSAGES.invalidRegularExpression),
    },
  };

  checkFieldValidity = throttle((fieldName: ValidatedFields, fieldValue) => {
    const {errors} = this.state;

    if (errors == null) {
      return;
    }

    if (errors[fieldName] && this.validatedFields[fieldName].isValid(fieldValue)) {
      delete errors[fieldName];
      this.setState({errors});
    }
  }, 150);

  constructor(props: DownloadRulesTabProps) {
    super(props);
    this.state = {
      errors: {},
      currentlyEditingRule: null,
      doesPatternMatchTest: false,
    };
  }

  getAmendedFormData(): Rule | null {
    if (this.formRef == null) {
      return null;
    }

    const formData = this.formRef.getFormData() as Partial<RuleFormData>;
    if (formData == null) {
      return null;
    }

    delete formData.check;

    return {
      ...defaultRule,
      ...formData,
      field: 'title',
      ...(formData.tags != null
        ? {
            tags: formData.tags.split(','),
          }
        : {
            tags: [],
          }),
    };
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
          <SelectItem key={feed._id} id={`${feed._id}`}>
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

  getModifyRuleForm(rule: Rule) {
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
            <FilesystemBrowserTextbox
              id="destination"
              label={this.props.intl.formatMessage({
                id: 'feeds.torrent.destination',
              })}
              selectable="directories"
              suggested={rule.destination}
              showBasePathToggle
            />
          </FormRowItem>
          <TagSelect
            id="tags"
            label={this.props.intl.formatMessage({
              id: 'feeds.apply.tags',
            })}
            placeholder={this.props.intl.formatMessage(MESSAGES.tags)}
            defaultValue={rule.tags}
          />
        </FormRow>
        <FormRow>
          <br />
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

  getRulesListItem(rule: Rule) {
    const matchedCount = rule.count || 0;
    let excludeNode = null;
    let tags = null;

    if (rule.exclude) {
      excludeNode = (
        <li
          className="interactive-list__detail-list__item
          interactive-list__detail interactive-list__detail--tertiary">
          <FormattedMessage id="feeds.exclude" />
          {rule.exclude}
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
          <FormattedMessage id="feeds.tags" />
          {tagNodes}
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
              <FormattedMessage id="feeds.match" />
              {rule.match}
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

  handleFormChange = ({
    event,
    formData,
  }: {
    event: Event | React.FormEvent<HTMLFormElement>;
    formData: Record<string, unknown>;
  }) => {
    const validatedField = (event.target as HTMLInputElement).name as ValidatedFields;
    const ruleFormData = formData as Partial<RuleFormData>;
    this.checkFieldValidity(validatedField, ruleFormData[validatedField]);
    this.checkMatchingPattern(
      ruleFormData.match != null ? ruleFormData.match : defaultRule.match,
      ruleFormData.exclude != null ? ruleFormData.exclude : defaultRule.exclude,
      ruleFormData.check != null ? ruleFormData.check : '',
    );
  };

  handleFormSubmit = () => {
    const {errors, isValid} = this.validateForm();

    if (!isValid) {
      this.setState({errors});
    } else {
      const currentRule = this.state.currentlyEditingRule;
      const formData = this.getAmendedFormData();

      if (formData != null) {
        if (currentRule !== null && currentRule !== defaultRule && currentRule._id != null) {
          FeedsStoreClass.removeRule(currentRule._id);
        }
        FeedsStoreClass.addRule(formData);
      }

      if (this.formRef != null) {
        this.formRef.resetForm();
      }

      this.setState({currentlyEditingRule: null});
    }
  };

  handleAddRuleClick = () => {
    this.setState({currentlyEditingRule: defaultRule});
  };

  handleRemoveRuleClick(rule: Rule) {
    if (rule._id != null) {
      FeedsStoreClass.removeRule(rule._id);
    }

    if (rule === this.state.currentlyEditingRule) {
      this.setState({currentlyEditingRule: null});
    }
  }

  handleModifyRuleClick(rule: Rule) {
    this.setState({currentlyEditingRule: rule});
  }

  checkMatchingPattern(match: RuleFormData['match'], exclude: RuleFormData['exclude'], check: RuleFormData['check']) {
    let doesPatternMatchTest = false;

    if (validators.isNotEmpty(check) && validators.isRegExValid(match) && validators.isRegExValid(exclude)) {
      const isMatched = new RegExp(match, 'gi').test(check);
      const isExcluded = exclude !== '' && new RegExp(exclude, 'gi').test(check);
      doesPatternMatchTest = isMatched && !isExcluded;
    }

    this.setState({doesPatternMatchTest});
  }

  validateForm(): {errors?: DownloadRulesTabStates['errors']; isValid: boolean} {
    const formData = this.getAmendedFormData();

    if (formData == null) {
      return {isValid: false};
    }

    const errors = Object.keys(this.validatedFields).reduce((accumulator: DownloadRulesTabStates['errors'], field) => {
      const fieldName = field as ValidatedFields;
      const fieldValue = formData[fieldName];

      if (!this.validatedFields[fieldName].isValid(fieldValue) && accumulator != null) {
        accumulator[fieldName] = this.validatedFields[fieldName].error;
      }

      return accumulator;
    }, {});

    if (errors == null) {
      return {isValid: true};
    }

    return {errors, isValid: !Object.keys(errors).length};
  }

  render() {
    let errors = null;
    if (this.state.errors != null) {
      errors = Object.keys(this.state.errors).map((error) => {
        const errorID = error as ValidatedFields;
        if (this.state.errors == null || this.state.errors[errorID] == null) {
          return null;
        }
        return (
          <FormRow key={errorID}>
            <FormError>{this.state.errors[errorID]}</FormError>
          </FormRow>
        );
      });
    }

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
            <br />
            <Button onClick={this.handleAddRuleClick}>
              <FormattedMessage id="button.new" />
            </Button>
          </FormRow>
        )}
      </Form>
    );
  }
}

const ConnectedDownloadRulesTab = connectStores<Omit<DownloadRulesTabProps, 'intl'>, DownloadRulesTabStates>(
  injectIntl(DownloadRulesTab),
  () => {
    return [
      {
        store: FeedsStore,
        event: 'SETTINGS_FEED_MONITORS_FETCH_SUCCESS',
        getValue: ({store}) => {
          const storeFeeds = store as typeof FeedsStore;
          return {
            feeds: storeFeeds.getFeeds(),
            rules: storeFeeds.getRules(),
          };
        },
      },
    ];
  },
);

export default ConnectedDownloadRulesTab;
