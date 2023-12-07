import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} from 'discord.js';
import nekoClient from 'nekos.life';

export default {
  name: 'interact_action',
  async execute(client, interaction) {
    try {
      const member = interaction.message.content.split(/[@,>]/);
      if (interaction.user.id !== member[3]) return;

      const sfw = new nekoClient();

      const subCommand = interaction.message.embeds[0].image?.url
        ? interaction.message.embeds[0].image.url.split('/')[3]
        : interaction.message.content.split('/')[3];
      const interact = await sfw[subCommand]();
      if (!interact) return;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder({
          custom_id: 'interact_action',
          style: ButtonStyle.Secondary,
          emoji: '🔂',
          disabled: true,
        })
      );

      let interactionData;

      if (
        interaction.channel
          .permissionsFor(interaction.guild.members.me)
          .has(PermissionsBitField.Flags.EmbedLinks)
      ) {
        interactionData = {
          content: interaction.language.commands.fun.interact[subCommand].repeat
            .replace('{member}', `<@${member[3]}>`)
            .replace('{author}', `<@${member[1]}>`),
          embeds: [new client.Embed().setImage(interact.url)],
        };
      } else {
        interactionData = {
          content:
            interaction.language.commands.fun.interact[subCommand].repeat
              .replace('{member}', `<@${member[3]}>`)
              .replace('{author}', `<@${member[1]}>`) + `\n${interact.url}`,
        };
      }

      interaction.editReply({ components: [row] });
      return interaction.followUp(interactionData);
    } catch (err) {
      console.log(err);
      return interaction.reply({
        content: `${interaction.emoji.no} | ${interaction.language.commands.fun.interact.errorResponse}`,
        ephemeral: true,
      });
    }
  },
};
