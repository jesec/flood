var React = require('react');
var ClientStore = require('../../stores/ClientStore');
var format = require('../../helpers/formatData');

var getClientStats = function() {
    return {
        clientStats: ClientStore.getStats()
    }
}

var Speed = React.createClass({
    getInitialState: function() {
        return null;
    },

    render: function() {
        return (
            <span className="speed">
                {this.props.value}
                <em className="unit">{this.props.unit}</em>
            </span>
        );
    }
});

var DataTransferred = React.createClass({
    getInitialState: function() {
        return null;
    },

    render: function() {
        return (
            <span className="transferred">
                {this.props.value}
                <em className="unit">{this.props.unit}</em>
            </span>
        );
    }
});

var ClientStats = React.createClass({

    getInitialState: function() {
        return {
            clientStats: {
                speed: {
                    upload: 0,
                    download: 0
                },
                transferred: {
                    upload: 0,
                    download: 0
                }
            }
        };
    },

    componentDidMount: function() {
        ClientStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        ClientStore.removeChangeListener(this._onChange);
    },

    render: function() {

        var uploadSpeed = format.data(this.state.clientStats.speed.upload, '/s');
        var uploadTotal = format.data(this.state.clientStats.transferred.upload);
        var downloadSpeed = format.data(this.state.clientStats.speed.download, '/s');
        var downloadTotal = format.data(this.state.clientStats.transferred.download);

        return (
            <div className="client-stats filter-bar__item">
                <div className="client-stat client-stat--upload">
                    <Speed value={uploadSpeed.value} unit={uploadSpeed.unit} />
                    <DataTransferred value={uploadTotal.value} unit={uploadTotal.unit} />
                </div>
                <div className="client-stat client-stat--download">
                    <Speed value={downloadSpeed.value} unit={downloadSpeed.unit} />
                    <DataTransferred value={downloadTotal.value} unit={downloadTotal.unit} />
                </div>
            </div>
        );
    },

    _onChange: function() {
        this.setState(getClientStats);
    }

});

module.exports = ClientStats;
