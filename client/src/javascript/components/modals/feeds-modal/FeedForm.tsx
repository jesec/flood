import {FC} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {Button, FormRow, FormRowGroup, Select, SelectItem, Textbox} from '@client/ui';

import type {Feed} from '@shared/types/Feed';

interface FeedFormProps {
  currentFeed: Feed | null;
  defaultFeed: Pick<Feed, 'interval' | 'label' | 'url'>;
  intervalMultipliers: Readonly<Array<{message: string; value: number}>>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const FeedForm: FC<FeedFormProps> = ({
  currentFeed,
  defaultFeed,
  intervalMultipliers,
  isSubmitting,
  onCancel,
}: FeedFormProps) => {
  const {i18n} = useLingui();
  const feedInterval = currentFeed?.interval ?? defaultFeed.interval;

  let defaultIntervalTextValue = feedInterval;
  let defaultIntervalMultiplier = 1;

  intervalMultipliers.forEach((interval) => {
    const intervalMultiplier = interval.value;

    if (feedInterval % intervalMultiplier === 0) {
      defaultIntervalTextValue = feedInterval / intervalMultiplier;
      defaultIntervalMultiplier = intervalMultiplier;
    }
  });

  return (
    <FormRowGroup>
      <FormRow>
        <Textbox
          id="label"
          label={i18n._('feeds.label')}
          placeholder={i18n._('feeds.label')}
          defaultValue={currentFeed?.label ?? defaultFeed.label}
        />
        <Textbox
          id="interval"
          label={i18n._('feeds.select.interval')}
          placeholder={i18n._('feeds.interval')}
          defaultValue={defaultIntervalTextValue}
          width="one-eighth"
        />
        <Select labelOffset defaultID={defaultIntervalMultiplier} id="intervalMultiplier" width="one-eighth">
          {intervalMultipliers.map((interval) => (
            <SelectItem key={interval.value} id={interval.value}>
              {i18n._(interval.message)}
            </SelectItem>
          ))}
        </Select>
      </FormRow>
      <FormRow>
        <Textbox
          id="url"
          label={i18n._('feeds.url')}
          placeholder={i18n._('feeds.url')}
          defaultValue={currentFeed?.url ?? defaultFeed?.url}
        />
        <Button labelOffset onClick={onCancel}>
          <Trans id="button.cancel" />
        </Button>
        <Button labelOffset type="submit" isLoading={isSubmitting}>
          <Trans id="button.save.feed" />
        </Button>
      </FormRow>
    </FormRowGroup>
  );
};

export default FeedForm;
