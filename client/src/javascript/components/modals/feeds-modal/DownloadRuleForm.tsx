import {FC} from 'react';
import {Trans, useLingui} from '@lingui/react';

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
} from '@client/ui';
import {CheckmarkThick} from '@client/ui/icons';
import FeedStore from '@client/stores/FeedStore';

import type {AddRuleOptions} from '@shared/types/api/feed-monitor';

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
  const {i18n} = useLingui();

  return (
    <FormRowGroup>
      <FormRow>
        <Textbox id="label" label={i18n._('feeds.label')} defaultValue={rule.label} />
        <Select
          disabled={!feeds.length}
          id="feedID"
          label={i18n._('feeds.applicable.feed')}
          defaultID={rule.feedIDs?.[0]}
        >
          {feeds.length === 0
            ? [
                <SelectItem key="empty" id="placeholder" isPlaceholder>
                  <em>
                    <Trans id="feeds.no.feeds.available" />
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
                  <SelectItem key="select-feed" id="placeholder" isPlaceholder>
                    <em>
                      <Trans id="feeds.select.feed" />
                    </em>
                  </SelectItem>,
                ],
              )}
        </Select>
      </FormRow>
      <FormRow>
        <Textbox
          id="match"
          label={i18n._('feeds.match.pattern')}
          placeholder={i18n._('feeds.regEx')}
          defaultValue={rule.match}
          width="three-eighths"
        />
        <Textbox
          id="exclude"
          label={i18n._('feeds.exclude.pattern')}
          placeholder={i18n._('feeds.regEx')}
          defaultValue={rule.exclude}
          width="three-eighths"
        />
      </FormRow>
      <FormRow>
        <Textbox
          addonPlacement="after"
          id="check"
          label={i18n._('feeds.test.match')}
          placeholder={i18n._('feeds.check')}
        >
          {isPatternMatched && (
            <FormElementAddon>
              <CheckmarkThick />
            </FormElementAddon>
          )}
        </Textbox>
      </FormRow>
      <FormRow>
        <FormRowItem>
          <FilesystemBrowserTextbox
            id="destination"
            label={i18n._('feeds.torrent.destination')}
            selectable="directories"
            suggested={rule.destination}
            showBasePathToggle
          />
        </FormRowItem>
        <TagSelect
          id="tags"
          label={i18n._('feeds.apply.tags')}
          placeholder={i18n._('feeds.tags')}
          defaultValue={rule.tags}
        />
      </FormRow>
      <FormRow align="end" justify="end">
        <br />
        <Checkbox id="startOnLoad" defaultChecked={rule.startOnLoad} matchTextboxHeight>
          <Trans id="feeds.start.on.load" />
        </Checkbox>
        <Button onClick={onCancel}>
          <Trans id="button.cancel" />
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          <Trans id="button.save.feed" />
        </Button>
      </FormRow>
    </FormRowGroup>
  );
};

export default DownloadRuleForm;
