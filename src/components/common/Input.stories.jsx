import Input from './Input';

export default {
  title: 'Common/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    as: {
      control: 'select',
      options: ['input', 'textarea'],
    },
  },
};

export const Text = {
  args: {
    id: 'story-input',
    value: 'Storybook value',
    placeholder: 'Type something',
    onChange: () => {},
  },
};

export const Textarea = {
  args: {
    id: 'story-textarea',
    as: 'textarea',
    value: 'Storybook textarea',
    placeholder: 'Write a longer response',
    rows: 5,
    onChange: () => {},
  },
};
