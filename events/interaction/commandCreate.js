import { PermissionsBitField } from 'discord.js';

export default {
  name: 'commandCreate',
  once: false,
  async execute(client, interaction) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (command.onlyDev && interaction.user.id !== process.env.DEVELOPER) {
      return interaction.reply({
        content: 'No',
        ephemeral: true,
      });
    }

    if (interaction.guildId) {
      if (command.channelPermissions) {
        for (let permission of command.channelPermissions) {
          if (
            !interaction.channel
              .permissionsFor(interaction.guild.members.me)
              .has(PermissionsBitField.Flags[permission])
          ) {
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
        }
      }

      if (command.memberPermissions) {
        for (let permission of command.memberPermissions) {
          if (
            !interaction.memberPermissions.has(
              PermissionsBitField.Flags[permission]
            )
          ) {
            return interaction.reply({
              content: `${
                interaction.emoji.no
              } | ${interaction.language.permissions.member.replace(
                '{permission}',
                interaction.language.permissions.collection[permission]
              )}`,
              ephemeral: true,
            });
          }
        }
      }

      if (command.clientPermissions) {
        for (let permission of command.clientPermissions) {
          if (
            !interaction.guild.members.me.permissions.has(
              PermissionsBitField.Flags[permission]
            )
          ) {
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
        }
      }
    }

    const userCooldown = await client.functions.isCmdCooldown(
      interaction.user.id,
      command
    );
    if (userCooldown.onCooldown) {
      return interaction.reply({
        content: `${
          interaction.emoji.time
        } | ${interaction.language.cooldown.message.replace(
          '{timeLeft}',
          `**${formatCooldownTime(
            userCooldown.timeLeft,
            interaction.language.cooldown
          )}**`
        )}`,
        ephemeral: true,
      });
    }

    try {
      return await command.execute(client, interaction);
    } catch {
      return interaction.reply({
        content: `${interaction.emoji.no} | ${interaction.language.error}`,
        ephemeral: true,
      });
    }
  },
};

function formatCooldownTime(timeLeft, language) {
  if (timeLeft >= 1) {
    return `${timeLeft.toFixed(0)} ${language.cooldown.seconds}`;
  } else {
    return `${(timeLeft * 1000).toFixed(2)} ${language.cooldown.milliseconds}`;
  }
}
