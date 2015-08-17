var React = require('react/addons');
var TransitionGroup = React.addons.CSSTransitionGroup;
var classnames = require('classnames');

var Action = require('./Action');

var SortDropdown = React.createClass({
  componentDidMount: function() {
    window.addEventListener('click', this._handleExternalClick);
  },

  componentWillUnmount: function() {
    window.removeEventListener('click', this._handleExternalClick);
  },

  getInitialState: function() {
    return {
      isExpanded: false
    }
  },

  getChildren: function() {
    return (
      <div className="dropdown__content" onClick={this._handleMenuWrapperClick}>
        <div className="dropdown__content__header">Add Torrent</div>
        <div className="dropdown__content__container">
          <div className="form__row">
            <input className="textbox"
              onChange={this._handleUrlChange}
              placeholder="Torrent URL"
              value={this.state.url}
              type="text" />
          </div>
          <div className="form__row">
            <input className="textbox"
              onChange={this._handleDestinationChange}
              placeholder="Destination"
              value={this.state.destination}
              type="text" />
          </div>
          <div className="form__row">
            <button className="button" onClick={this._handleAddTorrent}>Add Torrent</button>
          </div>
        </div>
      </div>
    );
  },

  render: function() {
    var classSet = classnames({
      'dropdown': true,
      'dropdown--align-right': true,
      'is-expanded': this.state.isExpanded
    });
    var children = null;

    if (this.state.isExpanded) {
      children = this.getChildren();
    }

    return (
      <div className={classSet}>
        <Action label="Add Torrent" slug="add-torrent" icon="add" clickHandler={this._handleButtonClick} />
        <TransitionGroup transitionName="dropdown__content">
          {children}
        </TransitionGroup>
      </div>
    );
  },

  handleDestinationChange: function(event) {
    this.setState({
      destination: event.target.value
    })
  },

  _handleUrlChange: function(event) {
    this.setState({
      url: event.target.value
    })
  },

  _handleAddTorrent: function() {
    TorrentActions.add({
      method: 'url',
      url: this.state.url,
      destination: this.state.destination
    });
  },

  _handleButtonClick: function(evt) {
    evt.stopPropagation();
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  },

  _handleExternalClick: function() {
    if (this.state.isExpanded) {
      this.setState({
        isExpanded: false
      });
    }
  },

  _handleMenuWrapperClick: function(evt) {
    evt.stopPropagation();
  }
});

module.exports = SortDropdown;
