import { PermissionsBitField } from 'discord.js';

export default {
  name: 'fetchChannel',
  async execute(client, { guildId, channelId }) {
    if (!channelId) return;

    const getCached = (channelId) =>
      client.channels.cache.get(channelId) || null;

    const getCluster = async (guildId, channelId) => {
      const results = await client.cluster
        .broadcastEval(
          async (client, context) => {
            const channel = client.channels.cache.get(context.channelId);
            if (
              !channel
                .permissionsFor(channel.guild.members.me)
                .has([
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ViewChannel,
                ])
            )
              return;

            return channel;
          },
          { context: { guildId, channelId } }
        )
        .catch(() => null);

      return results ? results.find((c) => c?.id === channelId) || false : null;
    };

    return (
      getCached(guildId, channelId) || getCluster(guildId, channelId) || null
    );
  },
};
