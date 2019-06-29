import React from 'react';

const connectStores = (Component, getEventListenerDescriptors) => {
  class ConnectedComponent extends React.Component {
    eventHandlersByStore = new Map();

    constructor(props) {
      super(props);
      this.state = getEventListenerDescriptors(props).reduce((state, eventListenerDescriptor) => {
        const {store, getValue} = eventListenerDescriptor;
        return {
          ...state,
          ...getValue({state, props, store, payload: null}),
        };
      }, {});
    }

    componentDidMount() {
      const eventListenerDescriptors = getEventListenerDescriptors(this.props);

      eventListenerDescriptors.forEach(eventListenerDescriptor => {
        const {store, event, getValue} = eventListenerDescriptor;
        const eventHandler = payload => this.setState((state, props) => getValue({state, props, store, payload}));
        const events = Array.isArray(event) ? event : [event];

        events.forEach(storeEvent => {
          store.listen(storeEvent, eventHandler);
        });

        if (this.eventHandlersByStore.get(store) == null) {
          this.eventHandlersByStore.set(store, new Set());
        }

        this.eventHandlersByStore.get(store).add({
          events,
          eventHandler,
        });
      });
    }

    componentWillUnmount() {
      this.eventHandlersByStore.forEach((listenerDescriptors, store) => {
        listenerDescriptors.forEach(({events, eventHandler}) => {
          events.forEach(event => {
            store.unlisten(event, eventHandler);
          });
        });
      });

      this.eventHandlersByStore.clear();
    }

    render() {
      return <Component {...this.props} {...this.state} />;
    }
  }

  return props => <ConnectedComponent {...props} />;
};

export default connectStores;
