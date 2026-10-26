import { Meta } from '@storybook/nextjs';
import { ContentHeader } from './ContentHeader';

const meta = {
  title: 'owncast/Components/Content Header',
  component: ContentHeader,
  parameters: {},
} satisfies Meta<typeof ContentHeader>;

export default meta;

export const Example = {
  args: {
    name: 'My Awesome Owncast Stream',
    summary: 'A calvacade of glorious sights and sounds',
    logo: 'https://watch.owncast.online/logo',
  },
};

export const LongContent = {
  args: {
    name: 'My Awesome Owncast Stream, streaming the best of streams and some lorem ipsum too',
    summary:
      'A calvacade of glorious sights and sounds. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    logo: 'https://watch.owncast.online/logo',
  },
};
