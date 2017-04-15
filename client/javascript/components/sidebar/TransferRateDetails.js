import classnames from 'classnames';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import Download from '../icons/Download';
import Duration from '../general/Duration';
import InfinityIcon from '../icons/InfinityIcon';
import Size from '../general/Size';
import Upload from '../icons/Upload';

const messages = defineMessages({
  ago: {
    id: 'general.ago',
    defaultMessage: 'ago'
  }
});

const icons = {
  download: <Download />,
  infinity: <InfinityIcon />,
  upload: <Upload />
};

class TransferRateDetails extends React.Component {
  constructor() {
    super();

    this.state = {inspectorPoint: null};
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.inspectorPoint != null) {
      this.setState({timestamp: nextProps.inspectorPoint.nearestTimestamp});
    }
  }

  getCurrentTansferRate(slug, options = {}) {
    let {
      props: {
        inspectorPoint,
        throttles,
        transferRate,
        transferTotals
      }
    } = this;

    let timestamp = null;

    const secondaryDataClasses = classnames(
      'client-stats__rate__data--secondary',
      {'is-visible': inspectorPoint == null}
    );

    const timestampClasses = classnames(
      'client-stats__rate__data--timestamp',
      {'is-visible': inspectorPoint != null && options.showHoverDuration}
    );

    if (inspectorPoint != null) {
      transferRate = {
        upload: inspectorPoint.uploadSpeed,
        download: inspectorPoint.downloadSpeed
      };
    }

    if (this.state.timestamp != null) {
      timestamp = (
        <div className={timestampClasses}>
          <Duration suffix={this.props.intl.formatMessage(messages.ago)}
            value={this.state.timestamp} />
        </div>
      );
    }

    let limit = null;

    if (throttles[slug] === 0) {
      limit = icons.infinity;
    } else {
      limit = <Size value={throttles[slug]} isSpeed={true} />;
    }

    return (
      <div className={`client-stats__rate client-stats__rate--${slug}`}>
        <div className="client-stats__rate__icon">
          {icons[slug]}
        </div>
        <div className="client-stats__rate__data">
          <div className="client-stats__rate__data--primary">
            <Size value={transferRate[slug]} isSpeed={true} />
          </div>
          {timestamp}
          <div className={secondaryDataClasses}>
            <div className="client-stats__rate__data--total">
              <Size value={transferTotals[slug]} />
            </div>
            <div className="client-stats__rate__data--limit">
              {limit}
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="client-stats__rates">
        {this.getCurrentTansferRate('download', {showHoverDuration: true})}
        {this.getCurrentTansferRate('upload')}
      </div>
    );
  }
}

export default injectIntl(TransferRateDetails);
