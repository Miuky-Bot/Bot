export default {
  name: 'fetchGuild',
  async execute(client, { guildId }) {
    if (!guildId) return;

    const getCached = (id) =>
      client.guilds.cache.get(id) ||
      client.guilds.cache.find((g) => g.name === id) ||
      null;

    const getCluster = async (id) =>
      await client.cluster
        .broadcastEval(
          (client, context) => client.guilds.cache.get(context.guildId),
          { context: { guildId: id } }
        )
        .then((res) => res.filter((g) => g?.id)[0])
        .catch(() => {
          return null;
        });

    const getApiFetch = async (id) =>
      await client.guilds.fetch(id, { cache: true }).catch(() => {
        return null;
      });

    return (
      getCached(guildId) || getCluster(guildId) || getApiFetch(guildId) || null
    );
  },
};
