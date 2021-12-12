import {FC, ReactElement, useRef, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {Button, Form, FormError, FormRow, FormRowItem} from '@client/ui';
import FeedActions from '@client/actions/FeedActions';
import {isNotEmpty, isPositiveInteger, isURLValid} from '@client/util/validators';

import type {AddFeedOptions} from '@shared/types/api/feed-monitor';
import type {Feed} from '@shared/types/Feed';

import FeedForm from './FeedForm';
import FeedItemsForm from './FeedItemsForm';
import FeedList from './FeedList';
import ModalFormSectionHeader from '../ModalFormSectionHeader';

const validatedFields = {
  url: {
    isValid: isURLValid,
    error: 'feeds.validation.must.specify.valid.feed.url',
  },
  label: {
    isValid: isNotEmpty,
    error: 'feeds.validation.must.specify.label',
  },
  interval: {
    isValid: isPositiveInteger,
    error: 'feeds.validation.interval.not.positive',
  },
} as const;

type ValidatedField = keyof typeof validatedFields;

const validateField = (validatedField: ValidatedField, value: string | undefined): string | undefined =>
  validatedFields[validatedField]?.isValid(value) ? undefined : validatedFields[validatedField]?.error;

interface FeedFormData {
  url: string;
  label: string;
  interval: string;
  intervalMultiplier: string;
}

const INTERVAL_MULTIPLIERS = [
  {
    message: 'feeds.time.min',
    value: 1,
  },
  {
    message: 'feeds.time.hr',
    value: 60,
  },
  {
    message: 'feeds.time.day',
    value: 1440,
  },
] as const;

const defaultFeed: AddFeedOptions = {
  label: '',
  interval: 5,
  url: '',
};

const FeedsTab: FC = () => {
  const formRef = useRef<Form>(null);
  const {i18n} = useLingui();
  const [currentFeed, setCurrentFeed] = useState<Feed | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  return (
    <div>
      <Form
        className="inverse"
        onChange={({event, formData}) => {
          const validatedField = (event.target as HTMLInputElement).name as ValidatedField;
          const feedForm = formData as unknown as FeedFormData;

          setErrors({
            ...errors,
            [validatedField]: validateField(validatedField, feedForm[validatedField]),
          });
        }}
        onSubmit={async () => {
          const feedForm = formRef.current?.getFormData() as unknown as FeedFormData;
          if (formRef.current == null || feedForm == null) {
            return;
          }

          setIsSubmitting(true);

          const currentErrors = Object.keys(validatedFields).reduce((memo, key) => {
            const validatedField = key as ValidatedField;

            return {
              ...memo,
              [validatedField]: validateField(validatedField, feedForm[validatedField]),
            };
          }, {} as Record<string, string | undefined>);
          setErrors(currentErrors);

          const isFormValid = Object.keys(currentErrors).every((key) => currentErrors[key] === undefined);

          if (isFormValid) {
            const feed: AddFeedOptions = {
              label: feedForm.label,
              url: feedForm.url,
              interval: Number(feedForm.interval) * Number(feedForm.intervalMultiplier),
            };

            let success = true;
            try {
              if (currentFeed === null) {
                await FeedActions.addFeed(feed);
              } else if (currentFeed?._id != null) {
                await FeedActions.modifyFeed(currentFeed._id, feed);
              }
            } catch {
              success = false;
            }

            if (success) {
              formRef.current.resetForm();
              setErrors({});
              setCurrentFeed(null);
              setIsEditing(false);
            } else {
              setErrors({backend: 'general.error.unknown'});
            }
          }

          setIsSubmitting(false);
        }}
        ref={formRef}
      >
        <ModalFormSectionHeader>
          <Trans id="feeds.existing.feeds" />
        </ModalFormSectionHeader>
        {Object.keys(errors).reduce((memo: Array<ReactElement>, key) => {
          if (errors[key as ValidatedField] != null) {
            memo.push(
              <FormRow key={`error-${key}`}>
                <FormError>{i18n._(errors?.[key as ValidatedField] as string)}</FormError>
              </FormRow>,
            );
          }

          return memo;
        }, [])}
        <FormRow>
          <FormRowItem>
            <FeedList
              currentFeed={currentFeed}
              intervalMultipliers={INTERVAL_MULTIPLIERS}
              onSelect={(feed) => {
                setCurrentFeed(feed);
                setIsEditing(true);
              }}
              onRemove={(feed) => {
                if (feed === currentFeed) {
                  if (isEditing) {
                    setErrors({});
                    setIsEditing(false);
                  }

                  setCurrentFeed(null);
                }

                if (feed._id != null) {
                  FeedActions.removeFeedMonitor(feed._id);
                }
              }}
            />
          </FormRowItem>
        </FormRow>
        {isEditing ? (
          <FeedForm
            currentFeed={currentFeed}
            defaultFeed={defaultFeed}
            key={currentFeed?._id || 'initial'}
            intervalMultipliers={INTERVAL_MULTIPLIERS}
            isSubmitting={isSubmitting}
            onCancel={() => {
              setErrors({});
              setIsEditing(false);
              setCurrentFeed(null);
            }}
          />
        ) : (
          <FormRow>
            <FormRowItem width="auto" />
            <Button
              onClick={() => {
                setIsEditing(true);
              }}
            >
              <Trans id="button.new" />
            </Button>
          </FormRow>
        )}
      </Form>
      <FeedItemsForm />
    </div>
  );
};

export default FeedsTab;
