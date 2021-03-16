import classnames from 'classnames';
import {FC} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';

import ClientStatusStore from '@client/stores/ClientStatusStore';
import {Download, InfinityIcon, Upload} from '@client/ui/icons';
import SettingStore from '@client/stores/SettingStore';
import TransferDataStore from '@client/stores/TransferDataStore';

import type {TransferDirection} from '@shared/types/TransferData';

import Duration from '../general/Duration';
import Size from '../general/Size';

import type {TransferRateGraphInspectorPoint} from './TransferRateGraph';

const icons = {
  download: <Download />,
  infinity: <InfinityIcon />,
  upload: <Upload />,
};

interface TransferRateDetailsProps {
  inspectorPoint?: TransferRateGraphInspectorPoint | null;
}

const TransferRateDetails: FC<TransferRateDetailsProps> = observer(({inspectorPoint}: TransferRateDetailsProps) => {
  const {i18n} = useLingui();

  const getCurrentTransferRate = (direction: TransferDirection, options: {showHoverDuration?: boolean} = {}) => {
    const {throttleGlobalDownSpeed = 0, throttleGlobalUpSpeed = 0} = SettingStore.clientSettings || {};
    const {transferSummary} = TransferDataStore;

    const throttles = {
      download: throttleGlobalDownSpeed,
      upload: throttleGlobalUpSpeed,
    };

    const transferTotals = {
      download: transferSummary.downTotal,
      upload: transferSummary.upTotal,
    };

    let transferRates = {
      download: transferSummary.downRate,
      upload: transferSummary.upRate,
    };

    if (inspectorPoint != null) {
      transferRates = {
        upload: inspectorPoint.upload,
        download: inspectorPoint.download,
      };
    }

    const secondaryDataClasses = classnames('client-stats__rate__data--secondary', {
      'is-visible': inspectorPoint == null && ClientStatusStore.isConnected,
    });

    const timestampClasses = classnames('client-stats__rate__data--timestamp', {
      'is-visible': inspectorPoint != null && options.showHoverDuration,
    });

    let timestamp = null;
    if (inspectorPoint?.timestamp != null) {
      timestamp = (
        <div className={timestampClasses}>
          <Duration suffix={i18n._('general.ago')} value={Math.trunc((Date.now() - inspectorPoint.timestamp) / 1000)} />
        </div>
      );
    }

    let limit = null;

    if (throttles[direction] === 0) {
      limit = icons.infinity;
    } else {
      limit = <Size value={throttles[direction]} isSpeed />;
    }

    return (
      <div className={`client-stats__rate client-stats__rate--${direction}`}>
        <div className="client-stats__rate__icon">{icons[direction]}</div>
        <div className="client-stats__rate__data">
          <div className="client-stats__rate__data--primary">
            <Size value={transferRates[direction]} isSpeed />
          </div>
          {timestamp}
          <div className={secondaryDataClasses}>
            <div className="client-stats__rate__data--total">
              <Size value={transferTotals[direction]} />
            </div>
            <div className="client-stats__rate__data--limit">{limit}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="client-stats__rates">
      {getCurrentTransferRate('download', {showHoverDuration: true})}
      {getCurrentTransferRate('upload')}
    </div>
  );
});

export default TransferRateDetails;
