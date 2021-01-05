import {FC} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {AddRuleOptions} from '@shared/types/api/feed-monitor';

import {
  Button,
  Checkbox,
  FormElementAddon,
  FormRow,
  FormRowGroup,
  FormRowItem,
  Select,
  SelectItem,
  Textbox,
} from '../../../ui';
import Checkmark from '../../icons/Checkmark';
import FeedStore from '../../../stores/FeedStore';
import FilesystemBrowserTextbox from '../../general/form-elements/FilesystemBrowserTextbox';
import TagSelect from '../../general/form-elements/TagSelect';

interface DownloadRuleFormProps {
  rule: AddRuleOptions;
  isSubmitting: boolean;
  isPatternMatched: boolean;
  onCancel: () => void;
}

const DownloadRuleForm: FC<DownloadRuleFormProps> = ({
  rule,
  isSubmitting,
  isPatternMatched,
  onCancel,
}: DownloadRuleFormProps) => {
  const {feeds} = FeedStore;
  const intl = useIntl();

  return (
    <FormRowGroup>
      <FormRow>
        <Textbox
          id="label"
          label={intl.formatMessage({
            id: 'feeds.label',
          })}
          defaultValue={rule.label}
        />
        <Select
          disabled={!feeds.length}
          id="feedID"
          label={intl.formatMessage({
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
          label={intl.formatMessage({
            id: 'feeds.match.pattern',
          })}
          placeholder={intl.formatMessage({
            id: 'feeds.regEx',
          })}
          defaultValue={rule.match}
          width="three-eighths"
        />
        <Textbox
          id="exclude"
          label={intl.formatMessage({
            id: 'feeds.exclude.pattern',
          })}
          placeholder={intl.formatMessage({
            id: 'feeds.regEx',
          })}
          defaultValue={rule.exclude}
          width="three-eighths"
        />
      </FormRow>
      <FormRow>
        <Textbox
          addonPlacement="after"
          id="check"
          label={intl.formatMessage({
            id: 'feeds.test.match',
          })}
          placeholder={intl.formatMessage({
            id: 'feeds.check',
          })}>
          {isPatternMatched && (
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
            label={intl.formatMessage({
              id: 'feeds.torrent.destination',
            })}
            selectable="directories"
            suggested={rule.destination}
            showBasePathToggle
          />
        </FormRowItem>
        <TagSelect
          id="tags"
          label={intl.formatMessage({
            id: 'feeds.apply.tags',
          })}
          placeholder={intl.formatMessage({
            id: 'feeds.tags',
          })}
          defaultValue={rule.tags}
        />
      </FormRow>
      <FormRow>
        <br />
        <Checkbox id="startOnLoad" defaultChecked={rule.startOnLoad} matchTextboxHeight>
          <FormattedMessage id="feeds.start.on.load" />
        </Checkbox>
        <Button onClick={onCancel}>
          <FormattedMessage id="button.cancel" />
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          <FormattedMessage id="button.save.feed" />
        </Button>
      </FormRow>
    </FormRowGroup>
  );
};

export default DownloadRuleForm;
