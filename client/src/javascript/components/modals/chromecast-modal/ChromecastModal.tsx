import {FC, useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import {CastButton, useCast, useCastPlayer} from 'react-cast-sender';
import classNames from 'classnames';

import type {TorrentContent} from '@shared/types/TorrentContent';

import {Form, FormRow, Select, SelectItem, FormRowItem} from '../../../ui';
import ProgressBar from '../../general/ProgressBar';
import Tooltip from '../../general/Tooltip';
import {Start, Stop, Pause} from '../../../ui/icons';
import Modal from '../Modal';
import TorrentActions from '../../../actions/TorrentActions';
import UIStore from '../../../stores/UIStore';
import {getChromecastContentType, isFileChromecastable, isFileSubtitles} from '../../../util/chromecastUtil';

type Subtitles = number | 'none';

const GenerateMagnetModal: FC = () => {
  const intl = useIntl();

  const {connected, initialized} = useCast();
  const {loadMedia, currentTime, duration, isPaused, isMediaLoaded, togglePlay} = useCastPlayer();

  const [contents, setContents] = useState<TorrentContent[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [selectedSubtitles, setSelectedSubtitles] = useState<Subtitles>('none');

  useEffect(() => {
    if (UIStore.activeModal?.id === 'chromecast') {
      TorrentActions.fetchTorrentContents(UIStore.activeModal?.hash).then((fetchedContents) => {
        if (fetchedContents != null) {
          setContents(fetchedContents);
        }
      });
    }
  }, []);

  if (!initialized)
    return (
      <Modal
        heading={intl.formatMessage({
          id: 'chromecast.modal.title',
        })}
        content={
          <div className="modal__content inverse">{intl.formatMessage({id: 'chromecast.modal.notSupported'})}</div>
        }
        actions={[
          {
            clickHandler: null,
            content: intl.formatMessage({
              id: 'button.close',
            }),
            triggerDismiss: true,
            type: 'tertiary',
          },
        ]}
      />
    );

  const mediaFiles = contents.filter((file) => isFileChromecastable(file.filename));
  const selectedFileName = (contents[selectedFileIndex]?.filename || '').replace(/\.\w+$/, '');
  const subtitleSources: Subtitles[] = [
    'none',
    ...contents
      .filter((file) => file.filename.startsWith(selectedFileName) && isFileSubtitles(file.filename))
      .map((file) => file.index),
  ];

  const beginCasting = async () => {
    if (!UIStore.activeModal?.hash || !connected) return;

    const hash = UIStore.activeModal?.hash;
    const {filename} = contents[selectedFileIndex];
    const contentType = getChromecastContentType(filename);
    if (!contentType) return;

    const mediaInfo = new window.chrome.cast.media.MediaInfo(
      await TorrentActions.getTorrentContentsDataPermalink(hash, [selectedFileIndex]),
      contentType,
    );

    const metadata = new chrome.cast.media.GenericMediaMetadata();
    metadata.title = contents[selectedFileIndex].filename;

    mediaInfo.metadata = metadata;

    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    if (selectedSubtitles !== 'none') {
      mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
      mediaInfo.textTrackStyle.backgroundColor = '#00000000';
      mediaInfo.textTrackStyle.edgeColor = '#000000FF';
      mediaInfo.textTrackStyle.edgeType = 'DROP_SHADOW';
      mediaInfo.textTrackStyle.fontFamily = 'SANS_SERIF';
      mediaInfo.textTrackStyle.fontScale = 1.0;
      mediaInfo.textTrackStyle.foregroundColor = '#FFFFFF';

      const track = new chrome.cast.media.Track(0, 'TEXT');
      track.name = 'Text';
      track.subtype = 'CAPTIONS';
      track.trackContentId = await TorrentActions.getTorrentContentsSubtitlePermalink(hash, selectedSubtitles);
      track.trackContentType = 'text/vtt';

      mediaInfo.tracks = [track];
      request.activeTrackIds = [0];
    }

    loadMedia(request);
  };

  const stopCasting = () => {
    const castSession = window.cast.framework.CastContext.getInstance().getCurrentSession();
    if (!castSession) return;

    const media = castSession.getMediaSession();
    if (!media) return;

    media.stop(new chrome.cast.media.StopRequest());
  };

  return (
    <Modal
      heading={intl.formatMessage({
        id: 'chromecast.modal.title',
      })}
      content={
        <div className="modal__content inverse">
          <Form>
            <FormRow>
              <Select
                id="fileIndex"
                label={intl.formatMessage({
                  id: 'chromecast.modal.file',
                })}
                onSelect={(fileIndex) => {
                  setSelectedFileIndex(Number(fileIndex));
                  setSelectedSubtitles('none');
                }}>
                {mediaFiles.map((file, i) => (
                  <SelectItem key={file.index} id={i}>
                    {file.filename}
                  </SelectItem>
                ))}
              </Select>
            </FormRow>
            <FormRow>
              <Select
                id="subtitleSource"
                label={intl.formatMessage({
                  id: 'chromecast.modal.subtitle',
                })}
                onSelect={(id) => {
                  if (id === 'none') setSelectedSubtitles('none');
                  else setSelectedSubtitles(Number(id));
                }}>
                {subtitleSources.map((source) => (
                  <SelectItem key={source} id={`${source}`}>
                    {source === 'none'
                      ? intl.formatMessage({
                          id: 'chromecast.modal.subtitle.none',
                        })
                      : contents[source].filename}
                  </SelectItem>
                ))}
              </Select>
            </FormRow>
            <FormRow align="center">
              <FormRowItem width="one-sixteenth">
                <CastButton />
              </FormRowItem>

              <FormRowItem width="one-sixteenth">
                <Tooltip
                  content={intl.formatMessage({id: isMediaLoaded ? 'chromecast.modal.stop' : 'chromecast.modal.start'})}
                  onClick={isMediaLoaded ? stopCasting : beginCasting}
                  suppress={!connected}
                  interactive={connected}
                  position="bottom"
                  wrapperClassName={classNames('modal__action', 'modal__icon-button', 'tooltip__wrapper', {
                    'modal__icon-button--interactive': connected,
                  })}>
                  {isMediaLoaded ? <Stop /> : <Start />}
                </Tooltip>
              </FormRowItem>

              {isMediaLoaded && (
                <FormRowItem width="one-sixteenth">
                  <Tooltip
                    content={intl.formatMessage({id: isPaused ? 'chromecast.modal.play' : 'chromecast.modal.pause'})}
                    onClick={togglePlay}
                    suppress={!connected}
                    interactive={connected}
                    position="bottom"
                    wrapperClassName={classNames('modal__action', 'modal__icon-button', 'tooltip__wrapper', {
                      'modal__icon-button--interactive': connected,
                    })}>
                    {isPaused ? <Start /> : <Pause />}
                  </Tooltip>
                </FormRowItem>
              )}

              <FormRowItem width="seven-eighths">
                <ProgressBar percent={isMediaLoaded ? (100 * currentTime) / duration : 0} />
              </FormRowItem>
            </FormRow>
          </Form>
        </div>
      }
      actions={[
        {
          clickHandler: null,
          content: intl.formatMessage({
            id: 'button.close',
          }),
          triggerDismiss: true,
          type: 'tertiary',
        },
      ]}
    />
  );
};

export default GenerateMagnetModal;
