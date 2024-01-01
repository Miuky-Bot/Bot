import { FLAGS } from '../../structures/extras/Flags.js';

export default {
  name: 'roles',
  async execute(client, req, res, connection) {
    try {
      let data;

      switch (req?.method?.toUpperCase()) {
        case 'GET': {
          if (!req?.data?.id) {
            throw new Error(FLAGS.ERROR.NOT_DEFINED('Id'));
          }

          data = await client.functions.fetchRole(client, {
            guildId: req?.data?.id,
            roleId: req?.data?.roleId,
          });

          break;
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
        console.log(err)
      return res({
        statusCode: 500,
        statusText: err.message,
      });
    }
  },
};
