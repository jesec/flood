import React from 'react';

import Download from '../Icons/Download';
import Size from '../General/Size';
import Upload from '../Icons/Upload';

const icons = {
  download: <Download />,
  upload: <Upload />
};

class TransferRateDetails extends React.Component {
  getCurrentTansferRate(slug) {
    let {props: {throttles, transferRate, transferTotals}} = this;

    if (this.props.inspectorPoint != null) {
      transferRate = {
        upload: this.props.inspectorPoint.uploadSpeed,
        download: this.props.inspectorPoint.downloadSpeed
      };
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
          <div className="client-stats__rate__data--secondary">
            <div className="client-stats__rate__data--total">
              <Size value={transferTotals[slug]} />
            </div>
            <div className="client-stats__rate__data--limit">
              <Size value={throttles[slug]} isSpeed={true} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="client-stats__rates">
        {this.getCurrentTansferRate('upload')}
        {this.getCurrentTansferRate('download')}
      </div>
    );
  }
}

export default TransferRateDetails;
