import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionsBitField,
  ButtonStyle,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Shows your profile avatar!')
    .setDescriptionLocalizations({
      'pt-BR': 'Mostra o seu avatar de perfil!',
    })
    .addUserOption((user) =>
      user
        .setName('user')
        .setDescription('<userId | @Mention>')
        .setDescriptionLocalizations({
          'pt-BR': '<Id do Usuário | @Menção>',
        })
    ),
  cooldown: 5,
  category: 'utils',
  async execute(client, interaction) {
    const member = interaction.options.getUser('user') || interaction.user;

    try {
      const avatar =
        member.avatarURL({ extension: 'png', dynamic: true, size: 4096 }) ||
        member.displayAvatarURL({
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
            label: interaction.language.commands.utils.avatar.label,
            style: ButtonStyle.Link,
            url: avatar,
          })
        );

        const embed = new client.Embed()
          .setTitle(`**${member.tag}**`)
          .setURL(avatar)
          .setImage(avatar);

        interactionData = { embeds: [embed], components: [row] };
      } else {
        interactionData = {
          content: `**${member.tag}**\n${avatar}`,
        };
      }

      return interaction.reply(interactionData);
    } catch {
      return interaction.reply({
        content: `${interaction.emoji.no} | ${interaction.language.commands.utils.avatar.error} \`${member}\``,
        ephemeral: true,
      });
    }
  },
};
