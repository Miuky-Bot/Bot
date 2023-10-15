import { FLAGS } from '../../structures/extras/Flags.js';

export default {
  name: 'commands',
  async execute(client, req, res, connection) {
    try {
      const language = req?.data?.lang;
      let data;

      switch (req?.method?.toUpperCase()) {
        case 'GET': {
          const command = client.commands.get(language);
          if (!command) {
            throw new Error(FLAGS.ERROR.NOT_DEFINED('Command Name'));
          }
          data = command;
          break;
        }
        default: {
          data = await client.commands.map((command) => {
            return {
              name:
                command?.data?.name_localizations?.[language] ||
                command?.data?.name,
              cooldown: command?.cooldown || 5,
              category: command?.category,
              description:
                command?.data?.description_localizations?.[language] ||
                command?.data?.description,
              options: command?.data?.options,
              permissions: {
                channel: command?.channelPermissions || null,
                member: command?.memberPermissions || null,
                client: command?.clientPermissions || null,
                default: command?.data?.default_permission || null,
                default_member:
                  command?.data?.default_member_permissions || null,
                dm: command?.data?.dm_permission || null,
              },
              nsfw: !!command?.data?.nsfw,
            };
          });
          break;
        }
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
