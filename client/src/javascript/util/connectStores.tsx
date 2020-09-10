import React from 'react';

import EventTypes from '../constants/EventTypes';

import AuthStore from '../stores/AuthStore';
import ClientStatusStore from '../stores/ClientStatusStore';
import UIStore from '../stores/UIStore';

interface GenericStore {
  listen: (event: keyof typeof EventTypes, eventHandler: (payload: unknown) => void) => void;
  unlisten: (event: keyof typeof EventTypes, eventHandler: (payload: unknown) => void) => void;
}

type Store = GenericStore | typeof AuthStore | typeof ClientStatusStore | typeof UIStore;

export interface EventListenerDescriptor<ConnectedComponentProps, ConnectedComponentStates> {
  store: Store;
  event: keyof typeof EventTypes | (keyof typeof EventTypes)[];
  getValue: (props: {
    payload: unknown;
    props: ConnectedComponentProps;
    state: ConnectedComponentStates;
    store: Store;
  }) => Partial<ConnectedComponentProps>;
}

const connectStores = <ConnectedComponentProps extends object, ConnectedComponentStates extends object = {}>(
  InputComponent: React.JSXElementConstructor<ConnectedComponentProps & ConnectedComponentStates>,
  getEventListenerDescriptors: (
    props: ConnectedComponentProps,
  ) => EventListenerDescriptor<ConnectedComponentProps, ConnectedComponentStates>[],
): ((props: ConnectedComponentProps) => React.ReactElement<ConnectedComponentProps>) => {
  class ConnectedComponent extends React.Component<ConnectedComponentProps, ConnectedComponentStates> {
    private eventHandlersByStore: Map<
      Store,
      Set<{events: (keyof typeof EventTypes)[]; eventHandler: (payload: unknown) => void}>
    > = new Map();

    private constructor(props: ConnectedComponentProps) {
      super(props);
      this.state = getEventListenerDescriptors(props).reduce(
        (state, eventListenerDescriptor): ConnectedComponentStates => {
          const {store, getValue} = eventListenerDescriptor;
          return {
            ...state,
            ...getValue({state, props, store, payload: null}),
          };
        },
        ({} as unknown) as ConnectedComponentStates,
      );
    }

    public componentDidMount(): void {
      const eventListenerDescriptors = getEventListenerDescriptors(this.props);

      eventListenerDescriptors.forEach((eventListenerDescriptor): void => {
        const {store, event, getValue} = eventListenerDescriptor;
        const eventHandler = (payload: unknown): void =>
          this.setState(
            (state: ConnectedComponentStates, props: ConnectedComponentProps): ConnectedComponentStates =>
              getValue({state, props, store, payload}) as ConnectedComponentStates,
          );
        const events = Array.isArray(event) ? event : [event];

        events.forEach((storeEvent): void => {
          store.listen(storeEvent, eventHandler);
        });

        if (this.eventHandlersByStore.get(store) == null) {
          const newSet: Set<{
            events: (keyof typeof EventTypes)[];
            eventHandler: (payload: unknown) => void;
          }> = new Set();
          this.eventHandlersByStore.set(store, newSet);
        }

        const eventHandlersForStore = this.eventHandlersByStore.get(store);
        if (eventHandlersForStore != null) {
          eventHandlersForStore.add({events, eventHandler});
        }
      });
    }

    public componentWillUnmount(): void {
      this.eventHandlersByStore.forEach((listenerDescriptors, store): void => {
        listenerDescriptors.forEach(({events, eventHandler}): void => {
          events.forEach((event): void => {
            store.unlisten(event, eventHandler);
          });
        });
      });

      this.eventHandlersByStore.clear();
    }

    public render(): React.ReactNode {
      return (
        <InputComponent {...(this.props as ConnectedComponentProps)} {...(this.state as ConnectedComponentStates)} />
      );
    }
  }

  return (props: ConnectedComponentProps): React.ReactElement<ConnectedComponentProps> => {
    return <ConnectedComponent {...props} />;
  };
};

export default connectStores;
