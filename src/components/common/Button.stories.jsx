import Button from './Button';

export default {
  title: 'Common/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'success'],
    },
  },
};

export const Primary = {
  args: {
    children: 'Continue',
    variant: 'primary',
  },
};

export const Disabled = {
  args: {
    children: 'Submitting...',
    variant: 'primary',
    disabled: true,
  },
};
