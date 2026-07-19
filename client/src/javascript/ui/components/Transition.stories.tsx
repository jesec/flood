import {useState} from 'react';
import {expect, userEvent, waitFor, within} from 'storybook/test';

import Transition from './Transition';

import type {Meta, StoryObj} from '@storybook/react-vite';

const meta = {
  title: 'UI/Components/Transition',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const MountAndUnmount: Story = {
  render: () => {
    const TransitionExample = () => {
      const [isIn, setIsIn] = useState(false);

      return (
        <div>
          <button type="button" onClick={() => setIsIn((value) => !value)}>
            Toggle
          </button>
          <Transition classNamePrefix="transition-test" in={isIn} mountOnEnter timeout={50} unmountOnExit>
            {(transitionClassName) => <div className={transitionClassName}>Content</div>}
          </Transition>
        </div>
      );
    };

    return <TransitionExample />;
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', {name: 'Toggle'});

    expect(canvas.queryByText('Content')).not.toBeInTheDocument();

    await userEvent.click(toggle);
    await waitFor(() => expect(canvas.getByText('Content')).toHaveClass('transition-test--entered'));

    await userEvent.click(toggle);
    await waitFor(() => expect(canvas.queryByText('Content')).not.toBeInTheDocument());
  },
};
