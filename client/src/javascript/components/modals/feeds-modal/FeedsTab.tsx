import {defineMessages, FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';
import throttle from 'lodash/throttle';

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
} from '../../../ui';
import Edit from '../../icons/Edit';
import Close from '../../icons/Close';
import FeedsStore, {FeedsStoreClass} from '../../../stores/FeedsStore';
import {minToHumanReadable} from '../../../i18n/languages';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import * as validators from '../../../util/validators';
import UIActions from '../../../actions/UIActions';
import connectStores from '../../../util/connectStores';

import type {Feed, Feeds, Items} from '../../../stores/FeedsStore';

interface IntervalMultiplier {
  displayName: string;
  value: number;
}

type ValidatedFields = 'url' | 'label' | 'interval';

interface FeedFormData extends Feed {
  intervalMultiplier: number;
}

interface FeedsTabProps extends WrappedComponentProps {
  feeds: Feeds;
  items: Items;
}

interface FeedsTabStates {
  errors?: {
    [field in ValidatedFields]?: string;
  };
  intervalMultipliers: Array<IntervalMultiplier>;
  currentlyEditingFeed: Feed | null;
  selectedFeedID: string | null;
}

const MESSAGES = defineMessages({
  mustSpecifyURL: {
    id: 'feeds.validation.must.specify.valid.feed.url',
  },
  mustSpecifyLabel: {
    id: 'feeds.validation.must.specify.label',
  },
  intervalNotPositive: {
    id: 'feeds.validation.interval.not.positive',
  },
  min: {
    id: 'feeds.time.min',
  },
  hr: {
    id: 'feeds.time.hr',
  },
  day: {
    id: 'feeds.time.day',
  },
  url: {
    id: 'feeds.url',
  },
  label: {
    id: 'feeds.label',
  },
  interval: {
    id: 'feeds.interval',
  },
  tags: {
    id: 'feeds.tags',
  },
  search: {
    id: 'feeds.search',
  },
});

const defaultFeed = {
  label: '',
  interval: 5,
  url: '',
};

class FeedsTab extends React.Component<FeedsTabProps, FeedsTabStates> {
  formRef: Form | null = null;

  manualAddingFormRef: Form | null = null;

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

  constructor(props: FeedsTabProps) {
    super(props);
    this.state = {
      errors: {},
      intervalMultipliers: [
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
      currentlyEditingFeed: null,
      selectedFeedID: null,
    };
  }

  getAmendedFormData(): Feed | null {
    if (this.formRef == null) {
      return null;
    }

    const formData = this.formRef.getFormData() as Partial<FeedFormData>;

    if (formData.interval != null && formData.intervalMultiplier != null) {
      formData.interval *= formData.intervalMultiplier;
    }

    delete formData.intervalMultiplier;

    return {...defaultFeed, ...formData};
  }

  getIntervalSelectOptions() {
    return this.state.intervalMultipliers.map((interval: IntervalMultiplier) => (
      <SelectItem key={interval.value} id={interval.value}>
        {interval.displayName}
      </SelectItem>
    ));
  }

  getAvailableFeedsOptions() {
    const {feeds} = this.props;

    if (!feeds.length) {
      return [
        <SelectItem key="empty" id="placeholder" placeholder>
          <em>
            <FormattedMessage id="feeds.no.feeds.available" />
          </em>
        </SelectItem>,
      ];
    }

    return feeds.reduce(
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
    );
  }

  getModifyFeedForm(feed: Feed) {
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
            })}
            placeholder={this.props.intl.formatMessage(MESSAGES.url)}
            defaultValue={feed.url}
          />
          <Button labelOffset onClick={() => this.setState({currentlyEditingFeed: null})}>
            <FormattedMessage id="button.cancel" />
          </Button>
          <Button labelOffset type="submit">
            <FormattedMessage id="button.save.feed" />
          </Button>
        </FormRow>
      </FormRowGroup>
    );
  }

  getFeedsListItem(feed: Feed) {
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
              <FormattedMessage id="feeds.match.count" values={{count: matchedCount}} />
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
              {minToHumanReadable(feed.interval)}
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

  getFeedAddForm(errors: React.ReactNode) {
    return (
      <Form
        className="inverse"
        onChange={this.handleFormChange}
        onSubmit={this.handleFormSubmit}
        ref={(ref) => {
          this.formRef = ref;
        }}>
        <ModalFormSectionHeader>
          <FormattedMessage id="feeds.existing.feeds" />
        </ModalFormSectionHeader>
        {errors}
        <FormRow>
          <FormRowItem>{this.getFeedsList()}</FormRowItem>
        </FormRow>
        {this.state.currentlyEditingFeed ? (
          this.getModifyFeedForm(this.state.currentlyEditingFeed)
        ) : (
          <FormRow>
            <FormRowItem width="auto">{null}</FormRowItem>
            <Button onClick={() => this.handleAddFeedClick()}>
              <FormattedMessage id="button.new" />
            </Button>
          </FormRow>
        )}
      </Form>
    );
  }

  getFeedsList() {
    const {feeds} = this.props;

    if (feeds.length === 0) {
      return (
        <ul className="interactive-list">
          <li className="interactive-list__item">
            <FormattedMessage id="feeds.no.feeds.defined" />
          </li>
        </ul>
      );
    }

    const feedsList = feeds.map((feed) => this.getFeedsListItem(feed));

    return <ul className="interactive-list feed-list">{feedsList}</ul>;
  }

  getFeedItemsForm() {
    return (
      <Form
        className="inverse"
        onChange={this.handleBrowseFeedChange}
        onSubmit={this.handleBrowseFeedSubmit}
        ref={(ref) => {
          this.manualAddingFormRef = ref;
        }}>
        <ModalFormSectionHeader>
          <FormattedMessage id="feeds.browse.feeds" />
        </ModalFormSectionHeader>
        <FormRow>
          <Select
            disabled={!this.props.feeds.length}
            grow={false}
            id="feedID"
            label={this.props.intl.formatMessage({
              id: 'feeds.select.feed',
            })}
            width="three-eighths">
            {this.getAvailableFeedsOptions()}
          </Select>
          {this.renderSearchField()}
          {this.renderDownloadButton()}
        </FormRow>
        {this.state.selectedFeedID && <FormRow>{this.getFeedItemsList()}</FormRow>}
      </Form>
    );
  }

  getFeedItemsList() {
    const {items} = this.props;

    if (items.length === 0) {
      return (
        <ul className="interactive-list">
          <li className="interactive-list__item">
            <div className="interactive-list__label">
              <FormattedMessage id="feeds.no.items.matching" />
            </div>
          </li>
        </ul>
      );
    }

    const itemsList = items.map((item, index) => (
      <li className="interactive-list__item interactive-list__item--stacked-content feed-list__feed" key={item.title}>
        <div className="interactive-list__label feed-list__feed-label">{item.title}</div>
        <Checkbox id={`${index}`} />
      </li>
    ));

    return <ul className="interactive-list feed-list">{itemsList}</ul>;
  }

  handleFormSubmit = () => {
    const {errors, isValid} = this.validateForm();

    if (!isValid) {
      this.setState({errors});
    } else {
      const currentFeed = this.state.currentlyEditingFeed;
      const formData = this.getAmendedFormData();

      if (formData != null) {
        if (currentFeed === defaultFeed) {
          FeedsStoreClass.addFeed(formData);
        } else if (currentFeed?._id != null) {
          FeedsStoreClass.modifyFeed(currentFeed._id, formData);
        }
      }
      if (this.formRef != null) {
        this.formRef.resetForm();
      }
      this.setState({currentlyEditingFeed: null});
    }
  };

  handleFormChange = ({
    event,
    formData,
  }: {
    event: Event | React.FormEvent<HTMLFormElement>;
    formData: Record<string, unknown>;
  }) => {
    const validatedField = (event.target as HTMLInputElement).name as ValidatedFields;
    const feedForm = formData as Partial<Feed>;
    this.checkFieldValidity(validatedField, feedForm[validatedField]);
  };

  handleRemoveFeedClick = (feed: Feed) => {
    if (feed._id != null) {
      FeedsStoreClass.removeFeed(feed._id);
    }

    if (feed === this.state.currentlyEditingFeed) {
      this.setState({currentlyEditingFeed: null});
    }
  };

  handleAddFeedClick = () => {
    this.setState({currentlyEditingFeed: defaultFeed});
  };

  handleModifyFeedClick = (feed: Feed) => {
    this.setState({currentlyEditingFeed: feed});
  };

  handleBrowseFeedChange = (input: {
    event: Event | React.FormEvent<HTMLFormElement>;
    formData: Record<string, unknown>;
  }) => {
    const feedBrowseForm = input.formData as {feedID: string; search: string};
    if ((input.event.target as HTMLInputElement).type !== 'checkbox') {
      this.setState({selectedFeedID: feedBrowseForm.feedID});
      FeedsStoreClass.fetchItems({params: {id: feedBrowseForm.feedID, search: feedBrowseForm.search}});
    }
  };

  handleBrowseFeedSubmit = () => {
    if (this.manualAddingFormRef == null) {
      return;
    }

    const formData = this.manualAddingFormRef.getFormData();

    const downloadedTorrents = this.props.items
      .filter((item, index) => formData[index])
      .map((torrent, index) => ({id: index, value: torrent.link}));

    UIActions.displayModal({id: 'add-torrents', initialURLs: downloadedTorrents});
  };

  validateForm(): {errors?: FeedsTabStates['errors']; isValid: boolean} {
    if (this.formRef == null) {
      return {isValid: false};
    }

    const formData = this.formRef.getFormData();
    const errors = Object.keys(this.validatedFields).reduce((memo: FeedsTabStates['errors'], field) => {
      const fieldName = field as ValidatedFields;
      const fieldValue = `${formData[fieldName]}`;

      return {
        ...memo,
        ...(!this.validatedFields[fieldName].isValid(fieldValue) && memo != null
          ? {fieldName: this.validatedFields[fieldName].error}
          : {}),
      };
    }, {});

    if (errors == null) {
      return {isValid: true};
    }

    return {errors, isValid: !Object.keys(errors).length};
  }

  renderSearchField = () => {
    const {selectedFeedID} = this.state;

    if (selectedFeedID == null) return null;

    return (
      <Textbox
        id="search"
        label={this.props.intl.formatMessage({
          id: 'feeds.search.term',
        })}
        placeholder={this.props.intl.formatMessage(MESSAGES.search)}
      />
    );
  };

  renderDownloadButton = () => {
    const {selectedFeedID} = this.state;

    if (selectedFeedID == null) return null;

    return (
      <Button key="button" type="submit" labelOffset>
        <FormattedMessage id="button.download" />
      </Button>
    );
  };

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
    return (
      <div>
        {this.getFeedAddForm(errors)}
        {this.getFeedItemsForm()}
      </div>
    );
  }
}

const ConnectedFeedsTab = connectStores<Omit<FeedsTabProps, 'intl'>, FeedsTabStates>(injectIntl(FeedsTab), () => {
  return [
    {
      store: FeedsStore,
      event: 'SETTINGS_FEED_MONITORS_FETCH_SUCCESS',
      getValue: ({store}) => {
        const storeFeeds = store as typeof FeedsStore;
        return {
          feeds: storeFeeds.getFeeds(),
        };
      },
    },
    {
      store: FeedsStore,
      event: 'SETTINGS_FEED_MONITOR_ITEMS_FETCH_SUCCESS',
      getValue: ({store}) => {
        const storeFeeds = store as typeof FeedsStore;
        return {
          items: storeFeeds.getItems() || [],
        };
      },
    },
  ];
});

export default ConnectedFeedsTab;
