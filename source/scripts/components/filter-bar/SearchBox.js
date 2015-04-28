var React = require('react');

var SearchBox = React.createClass({

    render: function() {

        return (
            <div className="filter-bar__item filter-bar__item--search">
                <input className="textbox" type="text" placeholder="Search Torrents" onKeyUp={this.props.searchChangeHandler} />
            </div>
        );
    }

});

module.exports = SearchBox;
