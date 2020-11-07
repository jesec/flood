import classnames from 'classnames';
import {Component} from 'react';
import {defineMessages, injectIntl, WrappedComponentProps} from 'react-intl';
import {observer} from 'mobx-react';

import type {TransferDirection} from '@shared/types/TransferData';

import ClientStatusStore from '../../stores/ClientStatusStore';
import Download from '../icons/Download';
import Duration from '../general/Duration';
import InfinityIcon from '../icons/InfinityIcon';
import SettingStore from '../../stores/SettingStore';
import Size from '../general/Size';
import TransferDataStore from '../../stores/TransferDataStore';
import Upload from '../icons/Upload';

import type {TransferRateGraphInspectorPoint} from './TransferRateGraph';

interface TransferRateDetailsProps extends WrappedComponentProps {
  inspectorPoint: TransferRateGraphInspectorPoint | null;
}

const messages = defineMessages({
  ago: {
    id: 'general.ago',
  },
});

const icons = {
  download: <Download />,
  infinity: <InfinityIcon />,
  upload: <Upload />,
};

@observer
class TransferRateDetails extends Component<TransferRateDetailsProps> {
  getCurrentTransferRate(direction: TransferDirection, options: {showHoverDuration?: boolean} = {}) {
    const {inspectorPoint, intl} = this.props;
    const {throttleGlobalDownMax = 0, throttleGlobalUpMax = 0} = SettingStore.clientSettings || {};
    const {transferSummary} = TransferDataStore;

    const throttles = {
      // Kb/s to B/s
      download: throttleGlobalDownMax * 1024,
      upload: throttleGlobalUpMax * 1024,
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
        upload: inspectorPoint.uploadSpeed,
        download: inspectorPoint.downloadSpeed,
      };
    }

    const secondaryDataClasses = classnames('client-stats__rate__data--secondary', {
      'is-visible': inspectorPoint == null && ClientStatusStore.isConnected,
    });

    const timestampClasses = classnames('client-stats__rate__data--timestamp', {
      'is-visible': inspectorPoint != null && options.showHoverDuration,
    });

    let timestamp = null;
    if (inspectorPoint?.nearestTimestamp != null) {
      timestamp = (
        <div className={timestampClasses}>
          <Duration
            suffix={intl.formatMessage(messages.ago)}
            value={Math.trunc((Date.now() - inspectorPoint.nearestTimestamp) / 1000)}
          />
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
  }

  render() {
    return (
      <div className="client-stats__rates">
        {this.getCurrentTransferRate('download', {showHoverDuration: true})}
        {this.getCurrentTransferRate('upload')}
      </div>
    );
  }
}

export default injectIntl(TransferRateDetails);
