import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {fn, within, userEvent, expect, waitFor} from 'storybook/test';
import {useRef} from 'react';

import Tooltip, {TooltipHandle} from './Tooltip';
import {TEST_TIMEOUTS, StoryErrorBoundary} from '../../test-utils/storybook-helpers';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/General/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <StoryErrorBoundary>
        <div
          style={{
            padding: '100px',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Story />
        </div>
      </StoryErrorBoundary>
    ),
  ],
  argTypes: {
    position: {
      control: {type: 'select'},
      options: ['top', 'bottom', 'left', 'right'],
    },
    align: {
      control: {type: 'select'},
      options: ['start', 'center', 'end'],
    },
    anchor: {
      control: {type: 'select'},
      options: ['start', 'center', 'end'],
    },
    interactive: {
      control: 'boolean',
    },
    stayOpen: {
      control: 'boolean',
    },
    suppress: {
      control: 'boolean',
    },
    wrapText: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to create position stories
const createPositionStory = (
  position: 'top' | 'bottom' | 'left' | 'right',
  content: string,
  buttonText: string,
): Story => ({
  args: {
    content,
    position,
    align: 'center',
    onOpen: fn(),
    onClose: fn(),
    onMouseLeave: fn(),
  },
  render: (args) => (
    <Tooltip {...args}>
      <button style={{padding: '10px 20px'}}>{buttonText}</button>
    </Tooltip>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('tooltip-trigger');

    // Test error case: ensure tooltip exists
    const tooltipBefore = canvas.queryByTestId('tooltip-content');
    if (!tooltipBefore) {
      throw new Error('Tooltip element not found in DOM');
    }

    await userEvent.hover(trigger);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent(content);
      expect(tooltip).toHaveAttribute('data-position', position);
    });

    await userEvent.unhover(trigger);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'false');
    });
  },
});

// Helper function to create alignment stories
const createAlignmentStory = (align: 'start' | 'center' | 'end', content: string, buttonText: string): Story => ({
  args: {
    content,
    position: 'top',
    align,
    onOpen: fn(),
    onClose: fn(),
    onMouseLeave: fn(),
  },
  render: (args) => (
    <Tooltip {...args}>
      <button style={{padding: '10px 40px'}}>{buttonText}</button>
    </Tooltip>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('tooltip-trigger');

    await userEvent.hover(trigger);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent(content);
      expect(tooltip).toHaveAttribute('data-align', align);
    });

    await userEvent.unhover(trigger);
  },
});

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    width: undefined,
    maxWidth: undefined,
    position: 'top',
    align: 'center',
    anchor: 'center',
    onOpen: fn(),
    onClose: fn(),
    onMouseLeave: fn(),
  },
  render: (args) => (
    <Tooltip {...args}>
      <button style={{padding: '10px 20px'}}>Hover me</button>
    </Tooltip>
  ),
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('tooltip-trigger');

    // Initially, tooltip should not be visible
    const initialTooltip = canvas.getByTestId('tooltip-content');
    expect(initialTooltip).toHaveAttribute('data-visible', 'false');

    // Hover to show tooltip
    await userEvent.hover(trigger);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'true');
      expect(tooltip).toHaveTextContent('This is a tooltip');
    });

    expect(args.onOpen).toHaveBeenCalled();

    // Unhover to hide tooltip
    await userEvent.unhover(trigger);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'false');
    });

    expect(args.onClose).toHaveBeenCalled();
    expect(args.onMouseLeave).toHaveBeenCalled();
  },
};

// Position stories
export const PositionTop = createPositionStory('top', 'Tooltip positioned at top', 'Top Position');
export const PositionBottom = createPositionStory('bottom', 'Tooltip positioned at bottom', 'Bottom Position');
export const PositionLeft = createPositionStory('left', 'Tooltip positioned at left', 'Left Position');
export const PositionRight = createPositionStory('right', 'Tooltip positioned at right', 'Right Position');

// Alignment stories
export const AlignStart = createAlignmentStory('start', 'Aligned to start', 'Start Aligned');
export const AlignEnd = createAlignmentStory('end', 'Aligned to end', 'End Aligned');

export const Interactive: Story = {
  args: {
    content: (
      <div>
        <p>This tooltip is interactive!</p>
        <button data-testid="tooltip-inner-button">Click me</button>
      </div>
    ),
    interactive: true,
    position: 'bottom',
    onOpen: fn(),
    onClose: fn(),
    onMouseLeave: fn(),
  },
  render: (args) => (
    <Tooltip {...args}>
      <button style={{padding: '10px 20px'}}>Interactive Tooltip</button>
    </Tooltip>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const triggerButton = canvas.getByTestId('tooltip-trigger');

    await userEvent.hover(triggerButton);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'true');
    });

    const tooltipButton = within(canvas.getByTestId('tooltip-content')).getByText('Click me');
    expect(tooltipButton).toBeInTheDocument();

    // Move to tooltip content
    await userEvent.hover(tooltipButton);

    // Tooltip should remain open (interactive mode)
    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'true');
    });

    await userEvent.unhover(tooltipButton);
    await userEvent.unhover(triggerButton);
  },
};

export const StayOpen: Story = {
  args: {
    content: 'This tooltip stays open',
    stayOpen: true,
    position: 'top',
    onOpen: fn(),
    onClose: fn(),
    onMouseLeave: fn(),
  },
  render: (args) => (
    <Tooltip {...args}>
      <button style={{padding: '10px 20px'}}>Stay Open</button>
    </Tooltip>
  ),
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('tooltip-trigger');

    await userEvent.hover(trigger);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'true');
      expect(tooltip).toHaveTextContent('This tooltip stays open');
    });

    expect(args.onOpen).toHaveBeenCalled();

    await userEvent.unhover(trigger);

    // Wait a moment to ensure it doesn't close
    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'true');
    });

    expect(args.onClose).not.toHaveBeenCalled();
  },
};

export const WithCustomWidth: Story = {
  args: {
    content: 'This tooltip has a custom width of 300px',
    width: 300,
    position: 'top',
    onOpen: fn(),
    onClose: fn(),
    onMouseLeave: fn(),
  },
  render: (args) => (
    <Tooltip {...args}>
      <button style={{padding: '10px 20px'}}>Custom Width</button>
    </Tooltip>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('tooltip-trigger');

    await userEvent.hover(trigger);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'true');
      expect(tooltip).toHaveTextContent('This tooltip has a custom width of 300px');
      expect(tooltip).toHaveStyle({width: '300px'});
    });

    await userEvent.unhover(trigger);
  },
};

export const WithMaxWidth: Story = {
  args: {
    content: 'This tooltip has a maximum width of 200px and will wrap its text when it exceeds this width',
    maxWidth: 200,
    wrapText: true,
    position: 'top',
    onOpen: fn(),
    onClose: fn(),
    onMouseLeave: fn(),
  },
  render: (args) => (
    <Tooltip {...args}>
      <button style={{padding: '10px 20px'}}>Max Width</button>
    </Tooltip>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('tooltip-trigger');

    await userEvent.hover(trigger);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'true');
      expect(tooltip).toHaveTextContent(/This tooltip has a maximum width/);
      expect(tooltip).toHaveStyle({maxWidth: '200px'});
      expect(tooltip).toHaveAttribute('data-wrap', 'true');
    });

    await userEvent.unhover(trigger);
  },
};

export const NoWrap: Story = {
  args: {
    content: 'This tooltip content will not wrap',
    wrapText: false,
    position: 'top',
    onOpen: fn(),
    onClose: fn(),
    onMouseLeave: fn(),
  },
  render: (args) => (
    <Tooltip {...args}>
      <button style={{padding: '10px 20px'}}>No Wrap</button>
    </Tooltip>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('tooltip-trigger');

    await userEvent.hover(trigger);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'true');
      expect(tooltip).toHaveTextContent('This tooltip content will not wrap');
      expect(tooltip).toHaveAttribute('data-wrap', 'false');
    });

    await userEvent.unhover(trigger);
  },
};

export const Suppressed: Story = {
  args: {
    content: 'This tooltip is suppressed and will not show',
    suppress: true,
    position: 'top',
    onOpen: fn(),
    onClose: fn(),
    onMouseLeave: fn(),
  },
  render: (args) => (
    <Tooltip {...args}>
      <button style={{padding: '10px 20px'}}>Suppressed (will not show)</button>
    </Tooltip>
  ),
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('tooltip-trigger');

    await userEvent.hover(trigger);

    // Tooltip should remain hidden
    await waitFor(
      () => {
        const tooltip = canvas.getByTestId('tooltip-content');
        expect(tooltip).toHaveAttribute('data-visible', 'false');
      },
      {timeout: TEST_TIMEOUTS.medium},
    );

    expect(args.onOpen).not.toHaveBeenCalled();

    await userEvent.unhover(trigger);

    expect(args.onClose).not.toHaveBeenCalled();
  },
};

export const CustomContent: Story = {
  args: {
    content: (
      <div style={{padding: '10px'}}>
        <h4 style={{margin: '0 0 10px 0'}}>Custom HTML Content</h4>
        <p style={{margin: '0 0 10px 0'}}>This tooltip contains custom HTML elements.</p>
        <ul style={{margin: '0', paddingLeft: '20px'}}>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </div>
    ),
    position: 'bottom',
    onOpen: fn(),
    onClose: fn(),
    onMouseLeave: fn(),
  },
  render: (args) => (
    <Tooltip {...args}>
      <button style={{padding: '10px 20px'}}>Custom Content</button>
    </Tooltip>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('tooltip-trigger');

    await userEvent.hover(trigger);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'true');

      const tooltipContent = within(tooltip);
      expect(tooltipContent.getByText('Custom HTML Content')).toBeInTheDocument();
      expect(tooltipContent.getByText('This tooltip contains custom HTML elements.')).toBeInTheDocument();
      expect(tooltipContent.getByText('Item 1')).toBeInTheDocument();
      expect(tooltipContent.getByText('Item 2')).toBeInTheDocument();
      expect(tooltipContent.getByText('Item 3')).toBeInTheDocument();
    });

    await userEvent.unhover(trigger);
  },
};

export const KeyboardAccessible: Story = {
  args: {
    content: 'This tooltip is keyboard accessible',
    position: 'top',
    onOpen: fn(),
    onClose: fn(),
    onMouseLeave: fn(),
  },
  render: (args) => (
    <Tooltip {...args}>
      <button style={{padding: '10px 20px'}}>Tab to focus</button>
    </Tooltip>
  ),
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('tooltip-trigger');

    // Focus the trigger
    trigger.focus();

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'true');
      expect(tooltip).toHaveTextContent('This tooltip is keyboard accessible');
    });

    expect(args.onOpen).toHaveBeenCalled();

    // Blur the trigger
    trigger.blur();

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'false');
    });

    expect(args.onClose).toHaveBeenCalled();
  },
};

export const WithRef: Story = {
  render: () => {
    const TooltipWithRef = () => {
      const tooltipRef = useRef<TooltipHandle>(null);

      return (
        <div style={{display: 'flex', gap: '20px'}}>
          <Tooltip
            ref={tooltipRef}
            content="Controlled via ref"
            position="top"
            onOpen={fn()}
            onClose={fn()}
            onMouseLeave={fn()}
          >
            <button style={{padding: '10px 20px'}}>Hover for tooltip</button>
          </Tooltip>
          <button
            style={{padding: '10px 20px'}}
            onClick={() => {
              if (tooltipRef.current) {
                tooltipRef.current.dismissTooltip(true);
              }
            }}
          >
            Dismiss tooltip
          </button>
        </div>
      );
    };

    return <TooltipWithRef />;
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const hoverButton = canvas.getByTestId('tooltip-trigger');
    const dismissButton = canvas.getByText('Dismiss tooltip');

    await userEvent.hover(hoverButton);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'true');
      expect(tooltip).toHaveTextContent('Controlled via ref');
    });

    // Dismiss via ref
    await userEvent.click(dismissButton);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'false');
    });

    // Hover again to ensure it still works
    await userEvent.hover(hoverButton);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'true');
    });

    await userEvent.unhover(hoverButton);
  },
};

export const RapidInteraction: Story = {
  args: {
    content: 'Testing rapid interactions',
    position: 'top',
    onOpen: fn(),
    onClose: fn(),
    onMouseLeave: fn(),
  },
  render: (args) => (
    <Tooltip {...args}>
      <button style={{padding: '10px 20px'}}>Rapid Hover Test</button>
    </Tooltip>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('tooltip-trigger');

    // Rapid hover/unhover sequence
    for (let i = 0; i < 3; i++) {
      await userEvent.hover(trigger);
      await waitFor(() => {
        const tooltip = canvas.getByTestId('tooltip-content');
        expect(tooltip).toBeInTheDocument();
      });
      await userEvent.unhover(trigger);
      await waitFor(() => {
        const tooltip = canvas.getByTestId('tooltip-content');
        expect(tooltip).toHaveAttribute('data-visible', 'false');
      });
    }

    // After rapid interactions, tooltip should still work normally
    await userEvent.hover(trigger);
    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'true');
    });

    await userEvent.unhover(trigger);
  },
};

export const ScrollDismissal: Story = {
  args: {
    content: 'Scrolling should dismiss this tooltip',
    position: 'top',
    onOpen: fn(),
    onClose: fn(),
    onMouseLeave: fn(),
  },
  render: (args) => (
    <div style={{height: '200vh', paddingTop: '50px'}}>
      <Tooltip {...args}>
        <button style={{padding: '10px 20px'}}>Scroll to dismiss</button>
      </Tooltip>
    </div>
  ),
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('tooltip-trigger');

    await userEvent.hover(trigger);

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'true');
    });

    // Simulate scroll
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      const tooltip = canvas.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-visible', 'false');
    });

    expect(args.onClose).toHaveBeenCalled();
  },
};
