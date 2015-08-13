var React = require('react');
var Icon = require('../icons/Icon');

var classnames = require('classnames');

var SearchBox = React.createClass({

  getInitialState: function() {
    return {
      searchValue: ''
    };
  },

  render: function() {
    var classSet = classnames({
      'filter-bar__item': true,
      'filter-bar__item--search': true,
      'is-in-use': this.state.searchValue !== ''
    });
    return (
      <div className={classSet}>
        <Icon icon="search" />
        <input className="textbox" type="text" placeholder="Search Torrents" onKeyUp={this._handleKeyUp} />
      </div>
    );
  },

  _handleKeyUp: function(evt) {
    var value = evt.target.value;
    this.setState({
      searchValue: value
    });
    this.props.searchChangeHandler(value);
  }

});

module.exports = SearchBox;
