import { Events } from 'discord.js';

export default {
  name: Events.GuildDelete,
  once: false,
  async execute(client, guild) {
    return client.webhook.message({
      content: `\`\`\`js\nType: Delete\nUserId: ${guild?.ownerId}\nGuild: ${
        guild?.name || null
      } (${guild?.id || null})\`\`\``,
    });
  },
};
