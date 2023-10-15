import { PermissionsBitField } from 'discord.js';

export default {
  name: 'fetchPermissions',
  async execute(client, { guildId, userId }) {
    if (!guildId) return;

    const getCluster = async (guildId, userId) => {
      const results = await client.cluster
        .broadcastEval(
          async (client, context) => {
            const guild = client.guilds.cache.get(context.guildId);
            const user = await guild?.members
              .fetch(context.userId, { cache: true })
              .catch(() => null);
            return user?.permissions.has(
              PermissionsBitField.Flags.Administrator
            );
          },
          { context: { guildId, userId } }
        )
        .catch(() => null);

      return results ? results.find((p) => p === true) || false : null;
    };

    return getCluster(guildId, userId) || null;
  },
};
