import {defineMessages, FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import {observer} from 'mobx-react';
import throttle from 'lodash/throttle';
import * as React from 'react';

import type {AddRuleOptions} from '@shared/types/api/feed-monitor';
import type {Rule} from '@shared/types/Feed';

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
import Checkmark from '../../icons/Checkmark';
import Close from '../../icons/Close';
import Edit from '../../icons/Edit';
import FeedActions from '../../../actions/FeedActions';
import FeedStore from '../../../stores/FeedStore';
import FilesystemBrowserTextbox from '../../general/form-elements/FilesystemBrowserTextbox';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import TagSelect from '../../general/form-elements/TagSelect';
import * as validators from '../../../util/validators';

type ValidatedFields = 'destination' | 'feedID' | 'label' | 'match' | 'exclude';

interface RuleFormData extends Omit<Rule, 'tags' | 'feedIDs'> {
  check: string;
  feedID: string;
  tags: string;
}

interface DownloadRulesTabStates {
  errors?: {
    [field in ValidatedFields]?: string;
  };
  isSubmitting: boolean;
  isFormChanged: boolean;
  currentlyEditingRule: Partial<Rule> | null;
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
  feedIDs: [''],
  match: '',
  exclude: '',
  tags: [],
  destination: '',
  startOnLoad: false,
};

@observer
class DownloadRulesTab extends React.Component<WrappedComponentProps, DownloadRulesTabStates> {
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

  constructor(props: WrappedComponentProps) {
    super(props);

    this.state = {
      errors: {},
      isSubmitting: false,
      isFormChanged: false,
      currentlyEditingRule: null,
      doesPatternMatchTest: false,
    };
  }

  getAmendedFormData(): AddRuleOptions | null {
    if (this.formRef == null) {
      return null;
    }

    const formData = this.formRef.getFormData() as Partial<RuleFormData>;
    if (formData == null) {
      return null;
    }

    const feedIDs = [formData.feedID || ''];

    delete formData.feedID;
    delete formData.check;

    return {
      ...defaultRule,
      ...formData,
      feedIDs,
      ...(formData.tags != null
        ? {
            tags: formData.tags.split(','),
          }
        : {
            tags: [],
          }),
    };
  }

  getModifyRuleForm(rule: Partial<Rule>) {
    const {doesPatternMatchTest, currentlyEditingRule} = this.state;
    const {feeds} = FeedStore;

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
            disabled={!feeds.length}
            id="feedID"
            label={this.props.intl.formatMessage({
              id: 'feeds.applicable.feed',
            })}
            defaultID={rule.feedIDs?.[0]}>
            {feeds.length === 0
              ? [
                  <SelectItem key="empty" id="placeholder" placeholder>
                    <em>
                      <FormattedMessage id="feeds.no.feeds.available" />
                    </em>
                  </SelectItem>,
                ]
              : feeds.reduce(
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
                )}
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
        </FormRow>
        <FormRow>
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
          <Button type="submit" isLoading={this.state.isSubmitting}>
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
          {': '}
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
          {': '}
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
              interactive-list__detail interactive-list__detail--tertiary"
              style={{
                maxWidth: '50%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
              <FormattedMessage id="feeds.match" />
              {': '}
              {rule.match}
            </li>
            <div style={{width: '100%'}} />
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

  getRulesList(): [React.ReactNode, React.ReactNode] {
    const {rules} = FeedStore;

    if (rules.length === 0) {
      return [
        <ul className="interactive-list" key="before-editing">
          <li className="interactive-list__item">
            <FormattedMessage id="feeds.no.rules.defined" />
          </li>
        </ul>,
        null,
      ];
    }

    const rulesList = rules.map((rule) => this.getRulesListItem(rule));

    if (this.state.currentlyEditingRule == null || this.state.currentlyEditingRule === defaultRule) {
      return [
        <ul className="interactive-list" key="before-editing">
          {rulesList}
        </ul>,
        null,
      ];
    }

    const editingRuleIndex = rules.indexOf(this.state.currentlyEditingRule as Rule);

    return [
      <ul className="interactive-list" key="before-editing">
        {rulesList.slice(0, editingRuleIndex + 1)}
      </ul>,
      <ul className="interactive-list" key="after-editing">
        {rulesList.slice(editingRuleIndex + 1)}
      </ul>,
    ];
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
    this.setState({isFormChanged: true});
  };

  handleFormSubmit = async () => {
    const {errors, isValid} = this.validateForm();

    this.setState({isSubmitting: true});

    if (!isValid) {
      this.setState({errors});
    } else {
      const currentRule = this.state.currentlyEditingRule;
      const formData = this.getAmendedFormData();

      if (formData != null && this.state.isFormChanged) {
        if (currentRule !== null && currentRule !== defaultRule && currentRule._id != null) {
          await FeedActions.removeFeedMonitor(currentRule._id);
        }
        await FeedActions.addRule(formData);
      }

      if (this.formRef != null) {
        this.formRef.resetForm();
      }

      this.setState({currentlyEditingRule: null});
    }

    this.setState({isSubmitting: false});
  };

  handleAddRuleClick = () => {
    this.setState({currentlyEditingRule: defaultRule});
  };

  handleRemoveRuleClick(rule: Rule) {
    if (rule._id != null) {
      FeedActions.removeFeedMonitor(rule._id);
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

  validateForm(): {
    errors?: DownloadRulesTabStates['errors'];
    isValid: boolean;
  } {
    const formData = this.getAmendedFormData();

    if (formData == null) {
      return {isValid: false};
    }

    const errors = Object.keys(this.validatedFields).reduce((accumulator: DownloadRulesTabStates['errors'], field) => {
      const fieldName = field as ValidatedFields;
      const fieldValue = fieldName === 'feedID' ? formData.feedIDs[0] : formData[fieldName];

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
        if (this.state.errors?.[errorID] == null) {
          return null;
        }
        return (
          <FormRow key={errorID}>
            <FormError>{this.state.errors[errorID]}</FormError>
          </FormRow>
        );
      });
    }

    const [listBeforeEditingRule, listAfterEditingRule] = this.getRulesList();

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
        {listAfterEditingRule == null ? (
          <FormRow>
            <FormRowItem>{listBeforeEditingRule}</FormRowItem>
          </FormRow>
        ) : (
          <FormRowGroup>
            <FormRow>{listBeforeEditingRule}</FormRow>
            {this.getModifyRuleForm(this.state.currentlyEditingRule as Partial<Rule>)}
            <FormRow>{listAfterEditingRule}</FormRow>
          </FormRowGroup>
        )}
        {this.state.currentlyEditingRule && listAfterEditingRule == null ? (
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

export default injectIntl(DownloadRulesTab);
