import { Events } from 'discord.js';

export default {
  name: Events.GuildRoleCreate,
  once: false,
  async execute(client, role) {
    client.netIpc.connections[0].send({
      connection: role?.guild?.id,
      type: 'guildRoleCreate',
      data: role,
    });
  },
};
