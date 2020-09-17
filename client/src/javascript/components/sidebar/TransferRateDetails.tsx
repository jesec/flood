import classnames from 'classnames';
import {defineMessages, injectIntl, WrappedComponentProps} from 'react-intl';
import formatUtil from '@shared/util/formatUtil';
import moment from 'moment';
import React from 'react';

import ClientStatusStore from '../../stores/ClientStatusStore';
import connectStores from '../../util/connectStores';
import Download from '../icons/Download';
import Duration from '../general/Duration';
import InfinityIcon from '../icons/InfinityIcon';
import Size from '../general/Size';
import TransferDataStore from '../../stores/TransferDataStore';
import Upload from '../icons/Upload';

import type {TransferDirection, TransferSummary} from '../../stores/TransferDataStore';
import type {TransferRateGraphInspectorPoint} from './TransferRateGraph';

interface TransferRateDetailsProps extends WrappedComponentProps {
  inspectorPoint: TransferRateGraphInspectorPoint | null;
  isClientConnected?: boolean;
  transferSummary?: TransferSummary;
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

class TransferRateDetails extends React.Component<TransferRateDetailsProps> {
  getCurrentTransferRate(direction: TransferDirection, options: {showHoverDuration?: boolean} = {}) {
    const {inspectorPoint, isClientConnected, transferSummary} = this.props;

    const throttles = {
      download: transferSummary != null ? transferSummary.downThrottle : 0,
      upload: transferSummary != null ? transferSummary.upThrottle : 0,
    };
    let timestamp = null;
    const transferTotals = {
      download: transferSummary != null ? transferSummary.downTotal : 0,
      upload: transferSummary != null ? transferSummary.upTotal : 0,
    };

    let transferRates = {
      download: transferSummary != null ? transferSummary.downRate : 0,
      upload: transferSummary != null ? transferSummary.upRate : 0,
    };

    if (inspectorPoint != null) {
      transferRates = {
        upload: inspectorPoint.uploadSpeed,
        download: inspectorPoint.downloadSpeed,
      };
    }

    const secondaryDataClasses = classnames('client-stats__rate__data--secondary', {
      'is-visible': inspectorPoint == null && isClientConnected,
    });

    const timestampClasses = classnames('client-stats__rate__data--timestamp', {
      'is-visible': inspectorPoint != null && options.showHoverDuration,
    });

    if (inspectorPoint != null && inspectorPoint.nearestTimestamp != null) {
      const currentTime = moment(Date.now());
      const durationSummary = formatUtil.secondsToDuration(
        moment.duration(currentTime.diff(moment(inspectorPoint.nearestTimestamp))).asSeconds(),
      );

      timestamp = (
        <div className={timestampClasses}>
          <Duration suffix={this.props.intl.formatMessage(messages.ago)} value={durationSummary} />
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

const ConnectedTransferRateDetails = connectStores<Omit<TransferRateDetailsProps, 'intl'>, Record<string, unknown>>(
  injectIntl(TransferRateDetails),
  () => {
    return [
      {
        store: ClientStatusStore,
        event: 'CLIENT_CONNECTION_STATUS_CHANGE',
        getValue: ({store}) => {
          const storeClientStatus = store as typeof ClientStatusStore;
          return {
            isClientConnected: storeClientStatus.getIsConnected(),
          };
        },
      },
      {
        store: TransferDataStore,
        event: 'CLIENT_TRANSFER_SUMMARY_CHANGE',
        getValue: ({store}) => {
          const storeTransferData = store as typeof TransferDataStore;
          return {
            transferSummary: storeTransferData.getTransferSummary(),
          };
        },
      },
    ];
  },
);

export default ConnectedTransferRateDetails;
