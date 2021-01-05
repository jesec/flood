import {FC, ReactNodeArray, useRef, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {AddRuleOptions} from '@shared/types/api/feed-monitor';
import type {Rule} from '@shared/types/Feed';

import {Button, Form, FormError, FormRow, FormRowItem} from '../../../ui';
import DownloadRuleForm from './DownloadRuleForm';
import FeedActions from '../../../actions/FeedActions';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import * as validators from '../../../util/validators';
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
    isValid: validators.isNotEmpty,
    error: 'feeds.validation.must.specify.destination',
  },
  feedID: {
    isValid: (value: string | undefined) => validators.isNotEmpty(value) && value !== 'placeholder',
    error: 'feeds.validation.must.select.feed',
  },
  label: {
    isValid: validators.isNotEmpty,
    error: 'feeds.validation.must.specify.label',
  },
  match: {
    isValid: (value: string | undefined) => validators.isNotEmpty(value) && validators.isRegExValid(value),
    error: 'feeds.validation.invalid.regular.expression',
  },
  exclude: {
    isValid: (value: string | undefined) => {
      if (validators.isNotEmpty(value)) {
        return validators.isRegExValid(value);
      }

      return true;
    },
    error: 'feeds.validation.invalid.regular.expression',
  },
} as const;

type ValidatedField = keyof typeof validatedFields;

const validateField = (validatedField: ValidatedField, value: string | undefined): string | undefined =>
  validatedFields[validatedField]?.isValid(value) ? undefined : validatedFields[validatedField]?.error;

interface RuleFormData extends Omit<Rule, 'tags' | 'feedIDs'> {
  check: string;
  feedID: string;
  tags: string;
}

const DownloadRulesTab: FC = () => {
  const formRef = useRef<Form>(null);
  const intl = useIntl();

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

            if (validators.isNotEmpty(check) && validators.isRegExValid(match) && validators.isRegExValid(exclude)) {
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

        setIsSubmitting(true);
        setErrors(
          Object.keys(validatedFields).reduce((memo, key) => {
            const validatedField = key as ValidatedField;

            return {
              ...memo,
              [validatedField]: validateField(validatedField, formData[validatedField]),
            };
          }, {} as Record<string, string | undefined>),
        );

        const isFormValid = Object.keys(errors).every((key) => errors[key] === undefined);

        if (isFormChanged && isFormValid) {
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
              setCurrentRule(null);
              setErrors({});
              setIsEditing(false);
            },
            (err: Error) => {
              setErrors({backend: err.message});
            },
          );
        }

        setIsSubmitting(false);
      }}
      ref={formRef}>
      <ModalFormSectionHeader>
        <FormattedMessage id="feeds.existing.rules" />
      </ModalFormSectionHeader>
      {Object.keys(errors).reduce((memo: ReactNodeArray, key) => {
        if (errors[key as ValidatedField] != null) {
          memo.push(
            <FormRow key={key}>
              <FormError>{intl.formatMessage({id: errors?.[key as ValidatedField]})}</FormError>
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
          rule={currentRule ?? initialRule}
          isPatternMatched={isPatternMatched}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setCurrentRule(null);
            setIsEditing(false);
          }}
        />
      ) : (
        <FormRow>
          <br />
          <Button
            onClick={() => {
              setIsEditing(true);
            }}>
            <FormattedMessage id="button.new" />
          </Button>
        </FormRow>
      )}
    </Form>
  );
};

export default DownloadRulesTab;
