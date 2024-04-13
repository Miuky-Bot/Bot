export default {
  name: 'fetchEmoji',
  async execute(client, { guildId, emojiId }) {
    if (!emojiId) return;

    const getCached = (guildId, emojiId) => {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return null;

      return guild.emojis.cache.get(emojiId) || null;
    };

    const getCluster = async (guildId, emojiId) => {
      const results = await client.cluster
        .broadcastEval(
          async (client, context) => {
            const guild = client.guilds.cache.get(context.guildId);
            if (!guild) return null;

            return guild.emojis.cache.get(context.emojiId) || null;
          },
          { context: { guildId, emojiId } }
        )
        .catch(() => null);

      return results ? results.find((c) => c?.id === emojiId) || false : null;
    };

    return getCached(guildId, emojiId) || getCluster(guildId, emojiId) || null;
  },
};
