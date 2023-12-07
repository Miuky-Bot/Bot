import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} from 'discord.js';
import nekoClient from 'nekos.life';

export default {
  data: new SlashCommandBuilder()
    .setName('interact')
    .setDescription('<kiss | hug | pat | slap | tickle>')
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription('Select a interaction!')
        .setDescriptionLocalizations({
          'pt-BR': 'Selecione uma interação!',
        })
        .setRequired(true)
        .addChoices(
          { name: 'kiss', value: 'kiss' },
          { name: 'hug', value: 'hug' },
          { name: 'pat', value: 'pat' },
          { name: 'slap', value: 'slap' },
          { name: 'tickle', value: 'tickle' }
        )
    )
    .addUserOption((user) =>
      user
        .setName('user')
        .setDescription('<userId | @Mention>')
        .setDescriptionLocalizations({
          'pt-BR': '<Id do Usuário | @Menção>',
        })
        .setRequired(true)
    ),
  cooldown: 5,
  category: 'fun',
  async execute(client, interaction) {
    const interact = interaction.options.getString('category');
    const member = interaction.options.getUser('user');

    try {
      const sfw = new nekoClient();
      const getInteractGif = await sfw[interact]();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder({
          custom_id: 'interact_action',
          style: ButtonStyle.Secondary,
          emoji: '🔂',
        })
      );

      let interactionData;

      if (
        interaction.channel
          .permissionsFor(interaction.guild.members.me)
          .has(PermissionsBitField.Flags.EmbedLinks)
      ) {
        interactionData = {
          content: interaction.language.commands.fun.interact[interact].response
            .replace('{member}', member.toString())
            .replace('{author}', interaction.user.toString()),
          embeds: [new client.Embed().setImage(getInteractGif.url)],
          components: [row],
        };
      } else {
        interactionData = {
          content:
            interaction.language.commands.fun.interact[interact].response
              .replace('{member}', member.toString())
              .replace('{author}', interaction.user.toString()) +
            `\n${getInteractGif.url}`,
          components: [row],
        };
      }

      interaction.reply(interactionData).then(async (int) => {
        if (!member.bot) return;
        await client.functions.wait(4000);

        const botInteract = await sfw[interact]();
        const botRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder({
            custom_id: 'interact_action',
            style: ButtonStyle.Secondary,
            emoji: '🔂',
            disabled: true,
          })
        );

        interaction.editReply({
          components: [botRow],
        });

        return interaction.followUp({
          content: interaction.language.commands.fun.interact[interact].repeat
            .replace('{member}', member.toString())
            .replace('{author}', interaction.user.toString()),
          embeds: [new client.Embed().setImage(botInteract.url)],
        });
      });
    } catch (err) {
      console.log(err);
      return interaction.reply({
        content: `${interaction.emoji.no} | ${interaction.language.commands.fun.interact.error} \`${member?.id}\``,
        ephemeral: true,
      });
    }
  },
};
