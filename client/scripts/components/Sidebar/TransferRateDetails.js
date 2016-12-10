import classnames from 'classnames';
import {FormattedMessage} from 'react-intl';
import React from 'react';

import Download from '../Icons/Download';
import Duration from '../General/Duration';
import Size from '../General/Size';
import Upload from '../Icons/Upload';

const icons = {
  download: <Download />,
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
          <Duration suffix="ago"
            value={this.state.timestamp} />
        </div>
      );
    }

    let limit = null;

    console.log(throttles[slug]);
    if (throttles[slug] === 0) {
      console.log('zero')
      limit = <FormattedMessage id="unit.time.infinity" defaultMessage="∞" />;
    } else {
      console.log('not zero')
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
        {this.getCurrentTansferRate('upload', {showHoverDuration: true})}
        {this.getCurrentTansferRate('download')}
      </div>
    );
  }
}

export default TransferRateDetails;
