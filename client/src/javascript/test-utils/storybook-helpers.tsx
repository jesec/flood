/**
 * Shared test utilities for Storybook stories
 */

import React from 'react';

/**
 * Creates a properly typed mock event for testing
 */
export function createMockMouseEvent(overrides?: Partial<React.MouseEvent>): React.MouseEvent {
  const div = document.createElement('div');
  // TypeScript requires this for event target compatibility
  const target = div as EventTarget & Element;

  const event: React.MouseEvent = {
    altKey: false,
    button: 0,
    buttons: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    metaKey: false,
    movementX: 0,
    movementY: 0,
    pageX: 0,
    pageY: 0,
    relatedTarget: null,
    screenX: 0,
    screenY: 0,
    shiftKey: false,
    currentTarget: target,
    target: target,
    nativeEvent: new MouseEvent('click'),
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: false,
    preventDefault: () => {},
    isDefaultPrevented: () => false,
    stopPropagation: () => {},
    isPropagationStopped: () => false,
    persist: () => {},
    timeStamp: Date.now(),
    type: 'click',
    getModifierState: () => false,
    detail: 0,
    // @ts-expect-error - React types require AbstractView but window works
    view: window,
    ...overrides,
  };

  return event;
}

/**
 * Asserts a value is not null and returns it typed
 */
export function assertNotNull<T>(value: T | null, message = 'Value should not be null'): T {
  if (value === null) {
    throw new Error(message);
  }
  return value;
}

/**
 * Standard timeouts for tests
 */
export const TEST_TIMEOUTS = {
  immediate: 100,
  short: 500,
  medium: 1000,
  long: 2000,
  veryLong: 5000,
} as const;

/**
 * Error boundary wrapper for stories
 */
export class StoryErrorBoundary extends React.Component<
  {children: React.ReactNode; fallback?: React.ReactNode},
  {hasError: boolean; error: Error | null}
> {
  constructor(props: {children: React.ReactNode; fallback?: React.ReactNode}) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error: Error) {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Story error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{padding: '20px', background: '#fee', border: '1px solid #fcc'}}>
            <h2>Story Error</h2>
            <pre>{this.state.error?.message}</pre>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Cleanup function for story teardown
 */
export function cleanupStory() {
  // Clear any timers
  jest.clearAllTimers();

  // Clear all mocks
  jest.clearAllMocks();

  // Reset document body
  document.body.innerHTML = '';

  // Clear local storage
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }

  // Clear session storage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
}
