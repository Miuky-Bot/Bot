import { FLAGS } from '../../structures/extras/Flags.js';

export default {
  name: 'guilds',
  async execute(client, req, res, connection) {
    try {
      let data;

      switch (req?.method?.toUpperCase()) {
        case 'GET': {
          if (!req?.data?.id) {
            throw new Error(FLAGS.ERROR.NOT_DEFINED('Id'));
          }
          data = await client.functions.fetchGuild(client, {
            guildId: req?.data?.id,
          });

          const userId = req?.data?.adminId;
          if (userId && data) {
            if (userId === data?.ownerId) {
              data.isAdmin = true;
            } else {
              console.log(data?.name);

              const user = await client.functions.fetchPermissions(client, {
                guildId: data?.id,
                userId,
              });

              console.log(user);

              if (!user) {
                throw new Error(FLAGS.UNAUTHORIZED);
              } else if (user?.id === data?.ownerId || user) {
                data.isAdmin = true;
              }
            }
          }
        }
      }

      if (!data) {
        throw new Error(FLAGS.ERROR.FETCH);
      }

      return res({
        statusCode: 200,
        statusText: FLAGS.STATUS[200],
        data,
      });
    } catch (err) {
      return res({
        statusCode: 500,
        statusText: err.message,
      });
    }
  },
};
