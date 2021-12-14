import {FC, ReactElement, useRef, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {Button, Form, FormError, FormRow, FormRowItem} from '@client/ui';
import FeedActions from '@client/actions/FeedActions';
import {isNotEmpty, isRegExValid} from '@client/util/validators';

import type {AddRuleOptions} from '@shared/types/api/feed-monitor';
import type {Rule} from '@shared/types/Feed';

import DownloadRuleForm from './DownloadRuleForm';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import DownloadRuleList from './DownloadRuleList';

const initialRule: AddRuleOptions = {
  label: '',
  feedIDs: [],
  match: '',
  exclude: '',
  tags: [],
  destination: '',
  startOnLoad: false,
};

const validatedFields = {
  destination: {
    isValid: isNotEmpty,
    error: 'feeds.validation.must.specify.destination',
  },
  feedID: {
    isValid: (value: string | undefined) => isNotEmpty(value) && value !== 'placeholder',
    error: 'feeds.validation.must.select.feed',
  },
  label: {
    isValid: isNotEmpty,
    error: 'feeds.validation.must.specify.label',
  },
  match: {
    isValid: (value: string | undefined) => isNotEmpty(value) && isRegExValid(value),
    error: 'feeds.validation.invalid.regular.expression',
  },
  exclude: {
    isValid: (value: string | undefined) => {
      if (isNotEmpty(value)) {
        return isRegExValid(value);
      }

      return true;
    },
    error: 'feeds.validation.invalid.regular.expression',
  },
} as const;

type ValidatedField = keyof typeof validatedFields;

const validateField = (validatedField: ValidatedField, value: string | undefined): string | undefined =>
  validatedFields[validatedField]?.isValid(value) ? undefined : validatedFields[validatedField]?.error;

interface RuleFormData {
  check: string;
  exclude: string;
  destination: string;
  field: string;
  feedID: string;
  label: string;
  match: string;
  tags: string;
  isBasePath: boolean;
  startOnLoad: boolean;
}

const DownloadRulesTab: FC = () => {
  const formRef = useRef<Form>(null);
  const {i18n} = useLingui();

  const [currentRule, setCurrentRule] = useState<Rule | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormChanged, setIsFormChanged] = useState<boolean>(false);
  const [isPatternMatched, setIsPatternMatched] = useState<boolean>(false);

  return (
    <Form
      className="inverse"
      onChange={({event, formData}) => {
        const validatedField = (event.target as HTMLInputElement).name as ValidatedField;
        const ruleFormData = formData as Partial<RuleFormData>;

        setErrors({
          ...errors,
          [validatedField]: validateField(validatedField, ruleFormData[validatedField]),
        });

        setIsPatternMatched(
          (() => {
            const {check, match = '', exclude = ''} = ruleFormData;

            if (isNotEmpty(check) && isRegExValid(match) && isRegExValid(exclude)) {
              const isMatched = new RegExp(match, 'gi').test(check);
              const isExcluded = exclude !== '' && new RegExp(exclude, 'gi').test(check);
              return isMatched && !isExcluded;
            }

            return false;
          })(),
        );

        setIsFormChanged(true);
      }}
      onSubmit={async () => {
        if (formRef.current == null) {
          return;
        }

        const formData = formRef.current.getFormData() as Partial<RuleFormData>;

        const currentErrors = Object.keys(validatedFields).reduce((memo, key) => {
          const validatedField = key as ValidatedField;

          return {
            ...memo,
            [validatedField]: validateField(validatedField, formData[validatedField]),
          };
        }, {} as Record<string, string | undefined>);
        setErrors(currentErrors);

        const isFormValid = Object.keys(currentErrors).every((key) => currentErrors[key] === undefined);

        if (isFormChanged && isFormValid) {
          setIsSubmitting(true);

          if (currentRule?._id != null) {
            await FeedActions.removeFeedMonitor(currentRule._id);
          }

          await FeedActions.addRule({
            label: formData.label ?? initialRule.label,
            feedIDs: [formData.feedID ?? ''],
            field: formData.field,
            match: formData.match ?? initialRule.match,
            exclude: formData.exclude ?? initialRule.exclude,
            destination: formData.destination ?? initialRule.destination,
            tags: formData.tags?.split(',') ?? initialRule.tags,
            startOnLoad: formData.startOnLoad ?? initialRule.startOnLoad,
            isBasePath: formData.isBasePath ?? false,
          }).then(
            () => {
              formRef.current?.resetForm();
              setErrors({});
              setCurrentRule(null);
              setIsEditing(false);
            },
            () => {
              setErrors({backend: 'general.error.unknown'});
            },
          );

          setIsSubmitting(false);
        }
      }}
      ref={formRef}
    >
      <ModalFormSectionHeader>
        <Trans id="feeds.existing.rules" />
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
          <DownloadRuleList
            currentRule={currentRule}
            onSelect={(rule) => {
              setCurrentRule(rule);
              setIsEditing(true);
            }}
            onRemove={(rule) => {
              if (rule._id != null) {
                FeedActions.removeFeedMonitor(rule._id);
              }

              if (rule === currentRule) {
                setCurrentRule(null);
                setIsEditing(false);
              }
            }}
          />
        </FormRowItem>
      </FormRow>
      {isEditing ? (
        <DownloadRuleForm
          key={currentRule?._id || 'initial'}
          rule={currentRule ?? initialRule}
          isPatternMatched={isPatternMatched}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setCurrentRule(null);
            setIsEditing(false);
          }}
        />
      ) : (
        <FormRow align="end" justify="end">
          <br />
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
  );
};

export default DownloadRulesTab;
