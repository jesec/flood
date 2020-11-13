import {FC} from 'react';
import {useIntl} from 'react-intl';
import {observer} from 'mobx-react';

import {compute, getTranslationString} from '../../util/size';
import TransferDataStore from '../../stores/TransferDataStore';

const WindowTitle: FC = observer(() => {
  const {transferSummary: summary} = TransferDataStore;
  const intl = useIntl();

  let title = 'Flood';

  if (summary != null && Object.keys(summary).length > 0) {
    const down = compute(summary.downRate);
    const up = compute(summary.upRate);

    const formattedDownSpeed = intl.formatNumber(down.value);
    const formattedUpSpeed = intl.formatNumber(up.value);

    const translatedDownUnit = intl.formatMessage(
      {
        id: 'unit.speed',
      },
      {
        baseUnit: intl.formatMessage({id: getTranslationString(down.unit)}),
      },
    );
    const translatedUpUnit = intl.formatMessage(
      {
        id: 'unit.speed',
      },
      {
        baseUnit: intl.formatMessage({id: getTranslationString(up.unit)}),
      },
    );

    title = `↓ ${formattedDownSpeed} ${translatedDownUnit} ↑ ${formattedUpSpeed} ${translatedUpUnit} - Flood`;
  }

  document.title = title;

  return null;
});

export default WindowTitle;
