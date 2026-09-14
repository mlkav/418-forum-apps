import {
  render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  describe, expect, it, vi,
} from 'vitest';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';

describe('common form components', () => {
  it('renders a Button and calls its click handler', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Continue</Button>);

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('disables a Button when requested', () => {
    render(<Button disabled>Continue</Button>);

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('renders an Input with its value and calls onChange', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input id="title" value="Initial" onChange={onChange} />);

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Updated');

    expect(onChange).toHaveBeenCalled();
  });

  it('renders a textarea when the as prop is textarea', () => {
    render(<Input as="textarea" id="body" value="Body" onChange={() => {}} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Body');
  });
});
