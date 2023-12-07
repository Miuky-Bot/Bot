import { PermissionsBitField } from 'discord.js';

export default {
  name: 'buttonCreate',
  once: false,
  async execute(client, interaction) {
    const buttonInteraction = client.interactions.get(interaction?.customId);
    if (!buttonInteraction) return;

    await interaction.deferUpdate();

    if (interaction?.message?.interaction && interaction?.guildId) {
      const command = client.commands.get(
        interaction.message.interaction.commandName
      );
      if (!command) return;

      if (
        command.onlyDev === true &&
        interaction.user.id !== process.env.DEVELOPER
      )
        return interaction.reply({
          content: 'No',
          ephemeral: true,
        });

      if (command?.channelPermissions)
        for (let permission of command.channelPermissions)
          if (
            !interaction.channel
              .permissionsFor(interaction.guild.members.me)
              .has(PermissionsBitField.Flags[permission])
          )
            return interaction.reply({
              content: `${
                interaction.emoji.no
              } | ${interaction.language.permissions.client.replace(
                '{permission}',
                interaction.language.permissions.collection[permission]
              )}`,
              ephemeral: true,
            });

      if (command?.memberPermissions)
        for (let permission of command.memberPermissions)
          if (
            !interaction.memberPermissions.has(
              PermissionsBitField.Flags[permission]
            )
          )
            return interaction.reply({
              content: `${
                interaction.emoji.no
              } | ${interaction.language.permissions.member.replace(
                '{permission}',
                interaction.language.permissions.collection[permission]
              )}`,
              ephemeral: true,
            });

      if (command?.clientPermissions)
        for (let permission of command.clientPermissions)
          if (
            !interaction.guild.members.me.permissions.has(
              PermissionsBitField.Flags[permission]
            )
          )
            return interaction.reply({
              content: `${
                interaction.emoji.no
              } | ${interaction.language.permissions.client.replace(
                '{permission}',
                interaction.language.permissions.collection[permission]
              )}`,
              ephemeral: true,
            });
    }

    try {
      return await buttonInteraction.execute(client, interaction);
    } catch (err) {
      console.log(err);
    }
  },
};
