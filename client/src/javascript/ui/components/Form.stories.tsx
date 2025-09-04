import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {within, userEvent, expect, waitFor, fn} from 'storybook/test';
import {useRef, useState} from 'react';

import Form, {FormHandle} from './Form';
import FormRow from './FormRow';
import FormRowGroup from './FormRowGroup';
import Checkbox from './Checkbox';
import Radio from './Radio';
import Select from './Select';
import Textbox from './Textbox';

const meta: Meta<typeof Form> = {
  title: 'UI/Components/Form',
  component: Form,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onChange: {action: 'changed'},
    onSubmit: {action: 'submitted'},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicForm: Story = {
  args: {
    onChange: fn(),
    onSubmit: fn(),
  },
  render: (args) => (
    <Form {...args}>
      <FormRow>
        <Textbox id="username" label="Username" placeholder="Enter username" />
      </FormRow>
      <FormRow>
        <Textbox id="password" label="Password" type="password" placeholder="Enter password" />
      </FormRow>
      <FormRow>
        <button type="submit">Submit</button>
      </FormRow>
    </Form>
  ),
};

export const WithCheckboxes: Story = {
  args: {
    onChange: fn(),
    onSubmit: fn(),
  },
  render: (args) => (
    <Form {...args}>
      <FormRow>
        <Checkbox id="agree">I agree to the terms</Checkbox>
      </FormRow>
      <FormRow>
        <Checkbox id="newsletter" defaultChecked>
          Subscribe to newsletter
        </Checkbox>
      </FormRow>
      <FormRow>
        <button type="submit">Submit</button>
      </FormRow>
    </Form>
  ),
};

export const WithRadioButtons: Story = {
  args: {
    onChange: fn(),
    onSubmit: fn(),
  },
  render: (args) => (
    <Form {...args}>
      <FormRowGroup>
        <FormRow>
          <Radio id="option1" groupID="options" defaultChecked>
            Option 1
          </Radio>
        </FormRow>
        <FormRow>
          <Radio id="option2" groupID="options">
            Option 2
          </Radio>
        </FormRow>
        <FormRow>
          <Radio id="option3" groupID="options">
            Option 3
          </Radio>
        </FormRow>
      </FormRowGroup>
      <FormRow>
        <button type="submit">Submit</button>
      </FormRow>
    </Form>
  ),
};

export const WithSelect: Story = {
  args: {
    onChange: fn(),
    onSubmit: fn(),
  },
  render: (args) => (
    <Form {...args}>
      <FormRow>
        <Select id="country" label="Country" defaultID="us">
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="ca">Canada</option>
          <option value="au">Australia</option>
        </Select>
      </FormRow>
      <FormRow>
        <button type="submit">Submit</button>
      </FormRow>
    </Form>
  ),
};

export const ComplexForm: Story = {
  args: {
    onChange: fn(),
    onSubmit: fn(),
  },
  render: (args) => (
    <Form {...args}>
      <FormRow>
        <Textbox id="name" label="Full Name" placeholder="John Doe" />
      </FormRow>
      <FormRow>
        <Textbox id="email" label="Email" type="text" placeholder="john@example.com" />
      </FormRow>
      <FormRow>
        <Select id="role" label="Role" defaultID="user">
          <option value="admin">Administrator</option>
          <option value="user">User</option>
          <option value="guest">Guest</option>
        </Select>
      </FormRow>
      <FormRowGroup>
        <FormRow>
          <Checkbox id="active" defaultChecked>
            Active Account
          </Checkbox>
        </FormRow>
        <FormRow>
          <Checkbox id="verified">Email Verified</Checkbox>
        </FormRow>
      </FormRowGroup>
      <FormRow>
        <button type="submit">Save User</button>
      </FormRow>
    </Form>
  ),
};

export const WithOnChangeHandler: Story = {
  render: () => {
    const FormWithState = () => {
      const [formData, setFormData] = useState<Record<string, unknown>>({});

      return (
        <div>
          <Form
            onChange={({formData}) => {
              setFormData(formData);
            }}
            onSubmit={({formData: _formData}) => {
              // Form submitted
            }}
          >
            <FormRow>
              <Textbox id="field1" label="Field 1" placeholder="Type something..." />
            </FormRow>
            <FormRow>
              <Textbox id="field2" label="Field 2" placeholder="Type something else..." />
            </FormRow>
            <FormRow>
              <button type="submit">Submit</button>
            </FormRow>
          </Form>
          <div style={{marginTop: '20px', padding: '10px', background: '#e8f5e9'}}>
            <h4>Current Form Data:</h4>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </div>
        </div>
      );
    };

    return <FormWithState />;
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByLabelText(/field 1/i)).toBeInTheDocument();
    });

    const field1 = canvas.getByLabelText(/field 1/i);
    const field2 = canvas.getByLabelText(/field 2/i);

    await userEvent.type(field1, 'a');

    await waitFor(() => {
      const output = canvas.getByText(/current form data:/i).parentElement;
      expect(output).toHaveTextContent('"field1": "a"');
    });

    await userEvent.type(field1, 'bc');

    await waitFor(() => {
      const output = canvas.getByText(/current form data:/i).parentElement;
      expect(output).toHaveTextContent('"field1": "abc"');
    });

    await userEvent.type(field2, 'test');

    await waitFor(() => {
      const output = canvas.getByText(/current form data:/i).parentElement;
      expect(output).toHaveTextContent('"field1": "abc"');
      expect(output).toHaveTextContent('"field2": "test"');
    });

    expect(field1).toHaveValue('abc');
    expect(field2).toHaveValue('test');
  },
};

export const WithRef: Story = {
  render: () => {
    const FormWithRef = () => {
      const formRef = useRef<FormHandle>(null);
      const [output, setOutput] = useState<string>('');

      return (
        <div>
          <Form ref={formRef}>
            <FormRow>
              <Textbox id="username" label="Username" placeholder="Enter username" />
            </FormRow>
            <FormRow>
              <Textbox id="email" label="Email" placeholder="Enter email" />
            </FormRow>
            <FormRow>
              <Checkbox id="subscribe">Subscribe to updates</Checkbox>
            </FormRow>
            <FormRow>
              <button
                type="button"
                onClick={() => {
                  if (formRef.current) {
                    const data = formRef.current.getFormData();
                    setOutput(JSON.stringify(data, null, 2));
                  }
                }}
              >
                Get Form Data
              </button>
              <button
                type="button"
                onClick={() => {
                  if (formRef.current) {
                    formRef.current.resetForm();
                    setOutput('Form reset!');
                  }
                }}
                style={{padding: '10px'}}
              >
                Reset Form
              </button>
            </FormRow>
          </Form>
          <div style={{marginTop: '20px', padding: '10px', background: '#e8f5e9'}}>
            <h4>Output:</h4>
            <pre>{output}</pre>
          </div>
        </div>
      );
    };

    return <FormWithRef />;
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByLabelText(/username/i)).toBeInTheDocument();
    });

    const usernameInput = canvas.getByLabelText(/username/i);
    const emailInput = canvas.getByLabelText(/email/i);
    const subscribeCheckbox = canvas.getByTestId('checkbox-subscribe');

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(subscribeCheckbox);

    const getDataBtn = canvas.getByRole('button', {name: /get form data/i});
    await userEvent.click(getDataBtn);

    await waitFor(() => {
      const output = canvas.getByText(/output:/i).parentElement;
      expect(output).toHaveTextContent('testuser');
      expect(output).toHaveTextContent('test@example.com');
      expect(output).toHaveTextContent('subscribe');
    });

    const resetBtn = canvas.getByRole('button', {name: /reset form/i});
    await userEvent.click(resetBtn);

    await waitFor(() => {
      expect(canvas.getByText(/form reset!/i)).toBeInTheDocument();
    });

    expect(usernameInput).toHaveValue('');
    expect(emailInput).toHaveValue('');
    expect(subscribeCheckbox).not.toBeChecked();
  },
};

export const WithCustomEventListener: Story = {
  render: () => {
    const FormWithCustomEvent = () => {
      const [eventLog, setEventLog] = useState<string[]>([]);

      return (
        <div>
          <Form
            onChange={({event}) => {
              const targetId = event.target && 'id' in event.target ? String(event.target.id) : 'unknown';
              setEventLog((prev) => [...prev, `Change event: ${targetId}`]);
            }}
            onSubmit={({event, formData}) => {
              event.preventDefault();
              setEventLog((prev) => [...prev, `Submit event: ${JSON.stringify(formData)}`]);
            }}
          >
            <FormRow>
              <Textbox id="field1" label="Field 1" />
            </FormRow>
            <FormRow>
              <Checkbox id="checkbox1">Check me</Checkbox>
            </FormRow>
            <FormRow>
              <button type="submit">Submit</button>
            </FormRow>
          </Form>
          <div
            style={{marginTop: '20px', padding: '10px', background: '#e8f5e9', maxHeight: '200px', overflow: 'auto'}}
          >
            <h4>Event Log:</h4>
            {eventLog.map((log, i) => (
              <div key={i} style={{fontFamily: 'monospace', fontSize: '12px'}}>
                {log}
              </div>
            ))}
          </div>
        </div>
      );
    };

    return <FormWithCustomEvent />;
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByLabelText(/field 1/i)).toBeInTheDocument();
    });

    const field1 = canvas.getByLabelText(/field 1/i);
    const checkbox = canvas.getByTestId('checkbox-checkbox1');
    const submitBtn = canvas.getByRole('button', {name: /submit/i});

    await userEvent.type(field1, 'test');

    await waitFor(() => {
      const eventLog = canvas.getByText(/event log:/i).parentElement;
      expect(eventLog).toHaveTextContent('Change event: field1');
    });

    await userEvent.click(checkbox);

    await waitFor(() => {
      const eventLog = canvas.getByText(/event log:/i).parentElement;
      expect(eventLog).toHaveTextContent('Change event: checkbox1');
    });

    await userEvent.click(submitBtn);

    await waitFor(() => {
      const eventLog = canvas.getByText(/event log:/i).parentElement;
      expect(eventLog).toHaveTextContent('Submit event:');
      expect(eventLog).toHaveTextContent('"field1":"test"');
      expect(eventLog).toHaveTextContent('"checkbox1":true');
    });

    const eventEntries = canvas.getAllByText(/event:/i);
    expect(eventEntries.length).toBeGreaterThanOrEqual(3);
  },
};

export const TestSubmitPrevention: Story = {
  args: {
    onSubmit: fn(),
  },
  render: (args) => (
    <Form {...args}>
      <FormRow>
        <Textbox id="test" label="Test Field" />
      </FormRow>
      <FormRow>
        <button type="submit">Submit (should prevent default)</button>
      </FormRow>
    </Form>
  ),
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', {name: /submit/i});

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalled();
    });

    // Verify that the form prevented default submission
    if (args.onSubmit) {
      expect(args.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          event: expect.objectContaining({
            defaultPrevented: true,
          }),
        }),
      );
    }
  },
};

export const TestOnChangeEvent: Story = {
  args: {
    onChange: fn(),
  },
  render: (args) => (
    <Form {...args}>
      <FormRow>
        <Textbox id="testInput" label="Test Input" />
      </FormRow>
    </Form>
  ),
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/test input/i);

    await userEvent.type(input, 'Hello');

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalled();
    });
  },
};

export const TestFormDataExtraction: Story = {
  render: () => {
    const TestForm = () => {
      const formRef = useRef<FormHandle>(null);
      const [result, setResult] = useState<Record<string, unknown> | null>(null);

      return (
        <div>
          <Form ref={formRef}>
            <FormRow>
              <Textbox id="text1" label="Text Field" defaultValue="default text" />
            </FormRow>
            <FormRow>
              <Checkbox id="check1" defaultChecked>
                Check this
              </Checkbox>
            </FormRow>
            <FormRowGroup>
              <FormRow>
                <Radio id="radio1" groupID="radioGroup" defaultChecked>
                  Option 1
                </Radio>
              </FormRow>
              <FormRow>
                <Radio id="radio2" groupID="radioGroup">
                  Option 2
                </Radio>
              </FormRow>
            </FormRowGroup>
            <FormRow>
              <button
                type="button"
                onClick={() => {
                  const data = formRef.current?.getFormData();
                  if (data) {
                    setResult(data);
                  }
                }}
              >
                Extract Data
              </button>
            </FormRow>
          </Form>
          {result && (
            <div style={{marginTop: '20px', padding: '10px', background: '#e8f5e9'}}>
              <h4>Extracted Data:</h4>
              <pre>{JSON.stringify(result, null, 2)}</pre>
              <div>
                ✓ Text field: {String(result.text1 || '')}
                <br />✓ Checkbox: {result.check1 ? 'checked' : 'unchecked'}
                <br />✓ Radio: {String(result.radioGroup || '')}
              </div>
            </div>
          )}
        </div>
      );
    };

    return <TestForm />;
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByLabelText(/text field/i)).toBeInTheDocument();
    });

    const textInput = canvas.getByLabelText(/text field/i);
    expect(textInput).toHaveValue('default text');

    const checkbox = canvas.getByTestId('checkbox-check1');
    expect(checkbox).toBeChecked();

    const radio1 = canvas.getByLabelText(/option 1/i);
    expect(radio1).toBeChecked();

    await userEvent.clear(textInput);
    await userEvent.type(textInput, 'new text value');
    await userEvent.click(checkbox);

    const radio2 = canvas.getByLabelText(/option 2/i);
    await userEvent.click(radio2);

    const extractBtn = canvas.getByRole('button', {name: /extract data/i});
    await userEvent.click(extractBtn);

    await waitFor(() => {
      expect(canvas.getByText(/extracted data:/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(canvas.getByText(/text field: new text value/i)).toBeInTheDocument();
      expect(canvas.getByText(/checkbox: unchecked/i)).toBeInTheDocument();
      expect(canvas.getByText(/radio: radio2/i)).toBeInTheDocument();
    });
  },
};
