import {FC, ReactElement, useRef, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {Button, Form, FormError, FormRow, FormRowItem} from '@client/ui';
import {isNotEmpty} from '@client/util/validators';


import ModalFormSectionHeader from '../ModalFormSectionHeader';
import WatchActions from '@client/actions/WatchActions';
import {AddWatchOptions} from '@shared/types/api/watch-monitor';
import WatchesForm from '@client/components/modals/fwatch-modal/WatchesForm';
import {WatchedDirectory} from '@shared/types/Watch';
import WatchList from '@client/components/modals/fwatch-modal/WatchList';

const validatedFields = {
  label: {
    isValid: isNotEmpty,
    error: 'feeds.validation.must.specify.label',
  },
  dir: {
    isValid: isNotEmpty,
    error: 'feeds.validation.must.specify.valid.feed.url',
  }
} as const;

type ValidatedField = keyof typeof validatedFields;

const validateField = (validatedField: ValidatedField, value: string | undefined): string | undefined =>
  validatedFields[validatedField]?.isValid(value) ? undefined : validatedFields[validatedField]?.error;

interface WatchesFormData {
  label: string;
  dir: string;
  destination: string;
  tags: string;
}

const defaultWatch: AddWatchOptions = {
  label: '',
  dir: '',
  destination: '',
  tags: [] as string[]
};

const WatchesTab: FC = () => {
  const formRef = useRef<Form>(null);
  const {i18n} = useLingui();
  const [currentWatch, setCurrentWatch] = useState<WatchedDirectory | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  return (
    <div>
      <Form
        className="inverse"
        onChange={({event, formData}) => {
          const validatedField = (event.target as HTMLInputElement).name as ValidatedField;
          const feedForm = formData as unknown as WatchesFormData;

          setErrors({
            ...errors,
            [validatedField]: validateField(validatedField, feedForm[validatedField]),
          });
        }}
        onSubmit={async () => {
          const feedForm = formRef.current?.getFormData() as unknown as WatchesFormData;
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
            const watch: AddWatchOptions = {
              label: feedForm.label,
              dir: feedForm.dir,
              destination: feedForm.destination,
              tags: feedForm.tags.split(',')
            };

            let success = true;
            try {
              if (currentWatch === null) {
                await WatchActions.addWatch(watch);
              } else if (currentWatch?._id != null) {
                await WatchActions.modifyWatch(currentWatch._id, watch);
              }
            } catch {
              success = false;
            }

            if (success) {
              formRef.current.resetForm();
              setErrors({});
              setCurrentWatch(null);
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
          <Trans id="watches.existing.watches" />
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
            <WatchList
              currentWatch={currentWatch}
              onSelect={(feed) => {
                setCurrentWatch(feed);
                setIsEditing(true);
              }}
              onRemove={(watch) => {
                if (watch === currentWatch) {
                  if (isEditing) {
                    setErrors({});
                    setIsEditing(false);
                  }

                  setCurrentWatch(null);
                }

                if (watch._id != null) {
                  WatchActions.removeWatchMonitors(watch._id);
                }
              }}
            />
          </FormRowItem>
        </FormRow>
        {isEditing ? (
          <WatchesForm
            currentWatch={currentWatch}
            defaultWatch={defaultWatch}
            key={currentWatch?._id || 'initial'}
            isSubmitting={isSubmitting}
            onCancel={() => {
              setErrors({});
              setIsEditing(false);
              setCurrentWatch(null);
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
    </div>
  );
};

export default WatchesTab;
