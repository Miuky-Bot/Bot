import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionsBitField,
  ButtonStyle,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('servericon')
    .setDescription('Show the server icon!')
    .setDescriptionLocalizations({
      'pt-BR': 'Mostra o ícone do servidor!',
    })
    .addStringOption((user) =>
      user
        .setName('guild')
        .setDescription('<guildId | guildName>')
        .setDescriptionLocalizations({
          'pt-BR': '<Id do Servidor | Nome do Servidor>',
        })
    ),
  cooldown: 5,
  category: 'utils',
  async execute(client, interaction) {
    const guildId =
      interaction.options.getString('guild') || interaction.guildId;
    const guild = await client.functions.fetchGuild(client, {
      guildId,
    });

    try {
      if (!guild?.available)
        return interaction.reply({
          content: `${interaction.emoji.no} | ${interaction.language.commands.utils.servericon.available}`,
          ephemeral: true,
        });

      const icon = guild.iconURL({
        extension: 'png',
        dynamic: true,
        size: 4096,
      });

      let interactionData;

      if (
        !interaction.guildId ||
        interaction.channel
          .permissionsFor(interaction.guild.members.me)
          .has(PermissionsBitField.Flags.EmbedLinks)
      ) {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder({
            label: interaction.language.commands.utils.servericon.label,
            style: ButtonStyle.Link,
            url: icon,
          })
        );

        const embed = new client.Embed()
          .setTitle(`**${guild.name}**`)
          .setURL(icon)
          .setImage(icon);

        interactionData = { embeds: [embed], components: [row] };
      } else {
        interactionData = {
          content: `**${guild.name}**\n${icon}`,
        };
      }

      return interaction.reply(interactionData);
    } catch {
      return interaction.reply({
        content: `${interaction.emoji.no} | ${interaction.language.commands.utils.servericon.error} \`${guildId}\``,
        ephemeral: true,
      });
    }
  },
};
