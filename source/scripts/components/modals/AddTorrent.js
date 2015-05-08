var React = require('react');
var Icon = require('../icons/Icon');
var UIActions = require('../../actions/UIActions');

var Modal = React.createClass({

    render: function() {

        return (
            <aside className="modal__window" onClick={this.props.clickHandler}>
                <header className="modal__header modal__header--toggle">
                    <h1>Add Torrent</h1>
                </header>
                <div className="modal__content">
                    <div className="form__row">
                        <input className="textbox" type="text" placeholder="Torrent URL" />
                    </div>
                    <div className="form__row">
                        <button className="button">Add Torrent</button>
                    </div>
                </div>
            </aside>
        );
    }
});

module.exports = Modal;
