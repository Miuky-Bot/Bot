import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Show your information!')
    .setDescriptionLocalizations({
      'pt-BR': 'Mostre a sua informação!',
    })
    .addUserOption((user) =>
      user
        .setName('user')
        .setDescription('<userId | @Mention>')
        .setDescriptionLocalizations({
          'pt-BR': '<Id do Usuário | @Menção>',
        })
    ),
  channelPermissions: ['EmbedLinks'],
  cooldown: 5,
  category: 'utils',
  async execute(client, interaction) {
    let user = interaction.options.getUser('user') !== null ? 'user' : 'normal';
    let member =
      user !== 'normal'
        ? interaction.options.getMember(user)
        : interaction.member;

    if (member?.user) {
      try {
        const avatar = member.user.displayAvatarURL({
          extension: 'png',
          dynamic: true,
          size: 4096,
        });
        const botEmoji = member.user.bot
          ? interaction.emoji.bot
          : interaction.emoji.user;
        const banner = await client.functions.fetchBannerURL(
          member.user.id,
          { size: 4096 },
          client
        );

        const roles = member.roles.cache
          .sort((a, b) => b.position - a.position)
          .map((role) => `**${role.toString()}**`)
          .slice(0, -1);

        const fieldData = [
          {
            name: `**${botEmoji} Tag**`,
            value: `${member.user.tag}\n\`${member.user.id}\``,
            inline: true,
          },
          {
            name: `${interaction.emoji.date} ${interaction.language.commands.utils.userinfo.createdAt}`,
            value: client.functions.formatDate(member.user.createdTimestamp, {
              language: interaction.language,
              format: true,
            }),
            inline: true,
          },
          {
            name: `${interaction.emoji.date} ${interaction.language.commands.utils.userinfo.joinedAt}`,
            value: client.functions.formatDate(member.joinedTimestamp, {
              language: interaction.language,
              format: true,
            }),
          },
        ];

        if (member.premiumSince) {
          fieldData.push({
            name: `**${interaction.emoji.boost} ${interaction.language.commands.utils.userinfo.premiumSince}**`,
            value: client.functions.formatDate(member.premiumSinceTimestamp, {
              language: interaction.language,
              format: true,
            }),
            inline: true,
          });
        }

        if (roles.length > 0) {
          fieldData.push({
            name: `**${interaction.emoji.bag} ${interaction.language.commands.utils.userinfo.roles} (${roles.length})**`,
            value: roles.join(' **|** '),
          });
        }

        const embed = new client.Embed()
          .setTitle(
            `**${client.functions.fetchBadges(
              member.user,
              interaction
            )} ${member.user.username.slice(0, 20)}**`
          )
          .setURL(process.env.WEBSITE)
          .setThumbnail(avatar)
          .setImage(banner || null)
          .addFields(fieldData);

        return interaction.reply({ embeds: [embed] });
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        let member = interaction.options.getUser(user);

        const avatar = member.displayAvatarURL({
          extension: 'png',
          dynamic: true,
          size: 4096,
        });

        const botEmoji = member.bot
          ? interaction.emoji.bot
          : interaction.emoji.user;
        const banner = await client.functions.fetchBannerURL(
          member.id,
          { size: 4096 },
          client
        );

        let fieldData = [
          {
            name: `**${botEmoji} Tag**`,
            value: `${member.tag}\n\`${member.id}\``,
            inline: true,
          },
        ];

        if (banner)
          fieldData.push({
            name: `${interaction.emoji.date} ${interaction.language.commands.utils.userinfo.createdAt}`,
            value: client.functions.formatDate(member.createdTimestamp, {
              language: interaction.language,
              format: true,
            }),
            inline: true,
          });
        else
          fieldData.push({
            name: `${interaction.emoji.date} ${interaction.language.commands.utils.userinfo.createdAt}`,
            value: client.functions.formatDate(member.createdTimestamp, {
              language: interaction.language,
              format: true,
            }),
          });

        const embed = new client.Embed()
          .setTitle(
            `**${client.functions.fetchBadges(
              member,
              interaction
            )} ${member.username.slice(0, 20)}**`
          )
          .setURL(process.env.WEBSITE)
          .setThumbnail(avatar)
          .setImage(banner || null)
          .addFields(fieldData);
        return interaction.reply({ embeds: [embed] });
      } catch (err) {
        console.log(err);
        return interaction.reply({
          content: `${interaction.emoji.no} | ${interaction.language.commands.utils.userinfo.error} \`${member}\``,
          ephemeral: true,
        });
      }
    }
  },
};
