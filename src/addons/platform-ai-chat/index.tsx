import type { Addon } from "@/app/addons/types";
import { IconMessageChatbot } from "@tabler/icons-react";
import { aiChatApi } from "./api/ai-chat-api";
import { AiChatPage } from "./ui/ai-chat-page";

export default {
  manifest: {
    id: "platform-ai-chat",
    name: "AI Chat",
    version: "1.0.0",
    description: "AI-powered chat interface backed by Ollama LLM via foundation-ai-chat-service.",
  },
  initialize: ({ httpClient, extensions }) => {
    aiChatApi.init(httpClient);
    extensions.navigation.registerNavItem({
      id: "platform-ai-chat-nav",
      label: "AI Chat",
      to: "/app/addons/platform-ai-chat",
      icon: ({ size }) => <IconMessageChatbot size={size} />,
      section: "workspace",
      order: 80,
    });
  },
  routes: [
    {
      path: "/app/addons/platform-ai-chat",
      component: async () => ({ default: AiChatPage }),
      auth: true,
    },
  ],
} satisfies Addon;
