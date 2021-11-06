import {FC} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';

import {compute, getTranslationString} from '../../util/size';
import SettingStore from '../../stores/SettingStore';
import TransferDataStore from '../../stores/TransferDataStore';

const WindowTitle: FC = observer(() => {
  const {UIPageTitleSpeedEnabled: enabled} = SettingStore.floodSettings;
  const {transferSummary: summary} = TransferDataStore;
  const {i18n} = useLingui();

  let title = 'Flood';

  if (enabled && summary != null && Object.keys(summary).length > 0) {
    const down = compute(summary.downRate);
    const up = compute(summary.upRate);

    const formattedDownSpeed = i18n.number(down.value);
    const formattedUpSpeed = i18n.number(up.value);

    const translatedDownUnit = i18n._('unit.speed', {
      baseUnit: i18n._(getTranslationString(down.unit)),
    });
    const translatedUpUnit = i18n._('unit.speed', {
      baseUnit: i18n._(getTranslationString(up.unit)),
    });

    title = `↓ ${formattedDownSpeed} ${translatedDownUnit} ↑ ${formattedUpSpeed} ${translatedUpUnit} - Flood`;
  }

  document.title = title;

  return null;
});

export default WindowTitle;
