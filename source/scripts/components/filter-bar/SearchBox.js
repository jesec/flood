var React = require('react');
var Icon = require('../icons/Icon');

var SearchBox = React.createClass({

  render: function() {

    return (
      <div className="filter-bar__item filter-bar__item--search">
        <Icon icon="search" />
        <input className="textbox" type="text" placeholder="Search Torrents" onKeyUp={this.props.searchChangeHandler} />
      </div>
    );
  }

});

module.exports = SearchBox;
