import React from 'react';

import EventTypes from '../constants/EventTypes';

interface GenericStore {
  listen: (event: keyof typeof EventTypes, eventHandler: (payload: unknown) => void) => void;
  unlisten: (event: keyof typeof EventTypes, eventHandler: (payload: unknown) => void) => void;
}

export interface EventListenerDescriptor<DerivedState, WrappedComponentProps = {}> {
  store: GenericStore;
  event: (keyof typeof EventTypes) | (keyof typeof EventTypes)[];
  getValue: (
    props: {
      payload: unknown;
      props: WrappedComponentProps;
      state: DerivedState;
      store: GenericStore;
    },
  ) => Partial<DerivedState>;
}

const connectStores = <DerivedState extends object, WrappedComponentProps extends object = {}>(
  InputComponent: React.JSXElementConstructor<WrappedComponentProps & DerivedState>,
  getEventListenerDescriptors: (
    props: WrappedComponentProps,
  ) => EventListenerDescriptor<DerivedState, WrappedComponentProps>[],
): ((props: WrappedComponentProps) => React.ReactElement<WrappedComponentProps>) => {
  class ConnectedComponent extends React.Component<WrappedComponentProps, DerivedState> {
    private eventHandlersByStore: Map<
      GenericStore,
      Set<{events: (keyof typeof EventTypes)[]; eventHandler: (payload: unknown) => void}>
    > = new Map();

    private constructor(props: WrappedComponentProps) {
      super(props);
      this.state = getEventListenerDescriptors(props).reduce(
        (state, eventListenerDescriptor): DerivedState => {
          const {store, getValue} = eventListenerDescriptor;
          return {
            ...state,
            ...getValue({state, props, store, payload: null}),
          };
        },
        ({} as unknown) as DerivedState,
      );
    }

    public componentDidMount(): void {
      const eventListenerDescriptors = getEventListenerDescriptors(this.props);

      eventListenerDescriptors.forEach(
        (eventListenerDescriptor): void => {
          const {store, event, getValue} = eventListenerDescriptor;
          const eventHandler = (payload: unknown): void =>
            this.setState(
              (state: DerivedState, props: WrappedComponentProps): DerivedState =>
                getValue({state, props, store, payload}) as DerivedState,
            );
          const events = Array.isArray(event) ? event : [event];

          events.forEach(
            (storeEvent): void => {
              store.listen(storeEvent, eventHandler);
            },
          );

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
        },
      );
    }

    public componentWillUnmount(): void {
      this.eventHandlersByStore.forEach(
        (listenerDescriptors, store): void => {
          listenerDescriptors.forEach(
            ({events, eventHandler}): void => {
              events.forEach(
                (event): void => {
                  store.unlisten(event, eventHandler);
                },
              );
            },
          );
        },
      );

      this.eventHandlersByStore.clear();
    }

    public render(): React.ReactNode {
      return <InputComponent {...this.props as WrappedComponentProps} {...this.state as DerivedState} />;
    }
  }

  return (props: WrappedComponentProps): React.ReactElement<WrappedComponentProps> => {
    return <ConnectedComponent {...props} />;
  };
};

export default connectStores;
