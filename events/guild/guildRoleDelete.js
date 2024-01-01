import { Events } from 'discord.js';

export default {
  name: Events.GuildRoleDelete,
  once: false,
  async execute(client, role) {
    client.netIpc.connections[0].send({
      connection: role?.guild?.id,
      type: 'guildRoleDelete',
      data: role,
    });
  },
};
