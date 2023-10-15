export default {
  name: 'fetchUser',
  async execute(user, options = { interactionData, guild }, client) {
    if (!user) return null;

    const { interactionData, guild } = options;
    const userId = getUserId(user);

    const getCached = (userId) => {
      if (interactionData) {
        return (
          interactionData.guild?.members.cache.get(userId) ||
          client.users.cache.get(userId) ||
          null
        );
      } else {
        return client.users.cache.get(userId) || null;
      }
    };

    const getApiFetch = async (userId) => {
      try {
        return await client.users.fetch(userId, { cache: true });
      } catch (error) {
        return null;
      }
    };

    const getMemberFetch = async (userId) => {
      if (guild) {
        try {
          return await guild.members.fetch(userId, { cache: true });
        } catch (error) {
          return null;
        }
      } else {
        return null;
      }
    };

    return (
      getCached(userId) ||
      (await getMemberFetch(userId)) ||
      (await getApiFetch(userId)) ||
      null
    );
  },
};

function getUserId(user) {
  const matches = user.match(/^<@!?(\d+)>$/);
  return matches ? matches[1] : user;
}
