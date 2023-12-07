import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all commands of the bot!')
    .setDescriptionLocalizations({
      'pt-BR': 'Mostra todos os comandos do bot!',
    })
    .addStringOption((option) =>
      option
        .setName('command')
        .setDescription('Search for a specific command!')
        .setDescriptionLocalizations({
          'pt-BR': 'Procurar um comando específico!',
        })
    ),
  channelPermissions: ['EmbedLinks'],
  cooldown: 5,
  category: 'utils',
  async execute(client, interaction) {
    const search = interaction.options.getString('command');

    if (search) {
      const command = client.commands.get(search);
      if (!command) {
        return interaction.reply({
          content: `${
            interaction.emoji.no
          } | ${interaction.language.commands.utils.help.search.error.replace(
            '{command}',
            search
          )}`,
          ephemeral: true,
        });
      }

      const { name, cooldown, category } = command.data;
      const description =
        interaction.language.commands[category.toLowerCase()][
          name.toLowerCase()
        ].description;

      const embed = new client.Embed().setDescription(
        `${
          interaction.language.commands.utils.help.search.name
        } \`${name}\`\n${interaction.language.commands.utils.help.search.cooldown.replace(
          '{number}',
          `\`${cooldown}\``
        )}\n${
          interaction.language.commands.utils.help.search.category
        } \`${category}\`\n${
          interaction.language.commands.utils.help.search.description
        }\n\`\`\`${description}\`\`\``
      );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      const buttons = interaction.language.commands.utils.help.buttons.map(
        (b) =>
          new ButtonBuilder({
            label: b.label,
            style: ButtonStyle.Link,
            url: b.url,
          })
      );

      const row = new ActionRowBuilder().addComponents(buttons);

      const embed = new client.Embed()
        .setTitle(
          `${
            interaction.language.commands.utils.help.embed.title
          } - Cluster ${Number(client.cluster.id + 1)} [${Number(
            interaction.guild.shardId + 1
          )}]`
        )
        .setURL(process.env.WEBSITE)
        .setThumbnail(client.user.avatarURL())
        .setDescription(
          interaction.language.commands.utils.help.embed.description
        )
        .addFields(
          interaction.language.commands.utils.help.embed.fields.map(
            ({ name, value, inline = false }) => ({
              name: `**${name}**`,
              value,
              inline,
            })
          )
        );

      return interaction.reply({ embeds: [embed], components: [row] });
    }
  },
};
