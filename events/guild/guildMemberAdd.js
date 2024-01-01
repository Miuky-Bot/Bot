import { Events } from 'discord.js';

export default {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(client, member) {
    try {
      const guildId = member?.guild?.id;
      if (!guildId) return;

      const dbGuild = await client.prisma.welcome.findUnique({
        where: {
          guildId,
        },
      });

      await WelcomeRolesData(dbGuild, member);
      await WelcomeMessageData(dbGuild, member, client, guildId);
    } catch (err) {
      console.log(err);
    }
  },
};

async function WelcomeRolesData(dbGuild, member) {
  if (!dbGuild || dbGuild?.role_enabled === false) return;

  if (
    member?.user?.bot &&
    dbGuild?.role_bot_ids !== null &&
    dbGuild?.role_bot_ids?.length > 0
  ) {
    member.roles.add(dbGuild?.role_bot_ids);
  } else if (dbGuild?.role_ids !== null && dbGuild?.role_ids?.length > 0) {
    member.roles.add(dbGuild?.role_ids);
  }
}

async function WelcomeMessageData(dbGuild, member, client, guildId) {
  if (!dbGuild || dbGuild?.enabled === false) return;
  if (!dbGuild?.channelId) return;

  let dataMessage = {
    content: null,
    embeds: [],
    files: [],
  };

  if (
    (typeof dbGuild?.content === 'string' &&
      dbGuild?.content?.trim()?.length !== 0) ||
    dbGuild?.content !== null ||
    dbGuild?.content !== undefined
  ) {
    dataMessage.content = dbGuild?.content
      ?.replace(/{user}/g, member?.toString())
      ?.replace(/{server}/g, member?.guild?.toString())
      ?.replace(/{membercount}/g, member?.guild?.memberCount);
  }

  if (dbGuild?.card_enabled) {
    const dbGuildLanguage = await client.prisma.language.findUnique({
      where: {
        guildId,
      },
    });

    const cardContent = dbGuild?.card_content;

    const CreateWelcomeCard = new client.WelcomeCard()
      .setTitle(
        dbGuildLanguage?.language === 'pt_BR' ? 'Bem-vindo' : 'Welcome',
        dbGuild?.card_title_color
      )
      .setUsername(member?.user?.username, dbGuild?.card_username_color)
      .setDescription(
        cardContent
          ?.replace(/{user}/g, member?.user?.username)
          ?.replace(/{server}/g, member?.guild?.name)
          ?.replace(/{membercount}/g, member?.guild?.memberCount),
        dbGuild?.card_content_color
      )
      .setBackground(
        dbGuild?.card_background_type,
        dbGuild?.card_background_type === 'image'
          ? dbGuild?.card_background_url
          : dbGuild?.card_background_color
      )
      .setOverlay(dbGuild?.card_overlay)
      .setAvatar(
        member.user.displayAvatarURL({ size: 4096, extension: 'jpg' }),
        dbGuild?.card_avatar_color
      );
    const WelcomeCard = await CreateWelcomeCard.createImage();

    dataMessage.files.push(WelcomeCard);
  }

  if (
    dbGuild?.enabled === true &&
    Boolean(dbGuild?.card_enabled) === false &&
    !dataMessage?.content
  )
    return;

  return member.guild.channels.cache.get(dbGuild?.channelId).send(dataMessage);
}
