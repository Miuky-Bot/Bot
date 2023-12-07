import { PermissionsBitField } from 'discord.js';

export default {
  name: 'fetchBadges',
  execute(user, interaction) {
    if (!user || !interaction) {
      throw new Error('User or Interaction is not defined.');
    }

    if (
      user.flags === null ||
      (interaction.guildId &&
        !interaction.channel
          .permissionsFor(interaction.guild.members.me)
          .has(PermissionsBitField.Flags.UseExternalEmojis))
    ) {
      return '';
    }

    let UserFlags = user.flags.toArray();
    let Flags = UserFlags.filter(
      (badge) => !!interaction.client.res.flags[badge]
    ).map((badge) => interaction.client.res.flags[badge]);

    if (user.avatar && user.avatar.startsWith('a_')) {
      Flags.push(interaction.client.res.flags['DISCORD_NITRO']);
    }

    if (interaction.guildId && interaction.guild.ownerId === user.id) {
      Flags.push(interaction.client.res.flags['GUILD_OWNER']);
    }

    return Flags.slice(0, 6).join(' ');
  },
};
