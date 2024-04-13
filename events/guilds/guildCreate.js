import { Events } from 'discord.js';

export default {
  name: Events.GuildCreate,
  once: false,
  async execute(client, guild) {
    return client.webhook.message({
      content: `\`\`\`js\nType: Create\nUserId: ${guild?.ownerId}\nGuild: ${
        guild?.name || null
      } (${guild?.id || null})\`\`\``,
    });
  },
};
