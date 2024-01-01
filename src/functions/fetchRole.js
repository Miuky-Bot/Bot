export default {
  name: 'fetchRole',
  async execute(client, { guildId, roleId }) {
    if (!roleId) return;

    const getCached = (guildId, roleId) => {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return null;

      return guild.roles.cache.get(roleId) || null;
    };

    const getCluster = async (guildId, roleId) => {
      const results = await client.cluster
        .broadcastEval(
          async (client, context) => {
            const guild = client.guilds.cache.get(context.guildId);
            if (!guild) return null;

            return guild.roles.cache.get(context.roleId) || null;
          },
          { context: { guildId, roleId } }
        )
        .catch(() => null);

      return results ? results.find((c) => c?.id === roleId) || false : null;
    };

    return getCached(guildId, roleId) || getCluster(guildId, roleId) || null;
  },
};
