import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { Meta, Story } from "@storybook/react";

import { store } from "../../store";
import { StoryGraphQLProvider } from "../../../stories/storyMocks";

import Uploads from "./Uploads";

type Props = {};

export default {
  title: "Uploads",
  component: Uploads,
  argTypes: {},
  args: {},
  decorators: [
    (Story) => (
      <StoryGraphQLProvider>
        <Story />
      </StoryGraphQLProvider>
    ),
  ],
} as Meta;

const Template: Story<Props> = (args) => (
  <Provider store={store}>
    <MemoryRouter>
      <Uploads {...args} />
    </MemoryRouter>
  </Provider>
);

export const Default = Template.bind({});
Default.args = {};