/**
 * @fileoverview Berkas Pengujian Komponen Form Umum (Common Form Components Unit Tests)
 *
 * Skenario Pengujian Utama:
 * 1. Pengujian Komponen Button:
 *    - Memastikan tombol merender label dengan benar dan memicu fungsi 'onClick' saat diklik.
 *    - Memastikan atribut 'disabled' berfungsi untuk menonaktifkan interaksi pada tombol.
 * 2. Pengujian Komponen Input:
 *    - Memastikan nilai atribut 'value' ditampilkan dan fungsi 'onChange' dipanggil saat pengguna mengetik.
 *    - Memastikan komponen merender elemen 'textarea' secara dinamis apabila prop 'as="textarea"' diberikan.
 */

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
