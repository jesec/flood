var React = require('react');
var Icon = require('../icons/Icon');
var UIActions = require('../../actions/UIActions');
var AddTorrent = require('./AddTorrent');

var Modal = React.createClass({

  render: function() {
    var modal = null;

    switch (this.props.type) {
      case 'torrent-add':
        modal = <AddTorrent clickHandler={this._onModalClick} />;
        break;
    }

    if (modal) {

      return (
        <div className="modal" onClick={this._onOverlayClick}>
          {modal}
        </div>
      );
    } else {

      return null;
    }

  },

  _onModalClick: function(e) {
    e.stopPropagation();
  },

  _onOverlayClick: function() {
    UIActions.dismissModals();
  }
});

module.exports = Modal;
