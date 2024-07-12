import { Events, resolveColor } from 'discord.js';

export default {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(client, member) {
    const guildId = member?.guild?.id;
    if (!guildId) return;

    let guild;
    try {
      guild = await client.prisma.guild.findUnique({
        where: { id: guildId },
        include: { welcomeGuild: true, welcomeDM: true, premium: true },
      });
    } catch (error) {
      console.error('Error fetching guild from database:', error);
    }

    const welcomeGuild = guild?.welcomeGuild;
    if (welcomeGuild?.role_enabled) {
      try {
        await assignWelcomeGuildRoles(welcomeGuild, member);
      } catch (error) {
        console.error('Error assigning welcome roles:', error);
      }
    }

    const guildChannel = client.channels.cache.get(welcomeGuild?.channel_id);
    if (welcomeGuild?.enabled && guildChannel) {
      try {
        await welcomeGuildMember(
          client,
          member,
          guild,
          welcomeGuild,
          guildChannel
        );
      } catch (error) {
        console.error('Error sending welcome guild message:', error);
      }
    }

    const welcomeDM = guild?.welcomeDM;
    if (welcomeDM?.enabled) {
      try {
        await welcomeDmMember(client, member, guild, welcomeDM);
      } catch (error) {
        console.error('Error sending welcome DM message:', error);
      }
    }
  },
};

async function welcomeDmMember(client, member, guild, welcomeDM) {
  try {
    const sendFunction =
      welcomeDM.content_type === 'text'
        ? sendTextWelcomeGuildMessage
        : sendEmbedWelcomeGuildMessage;

    await sendFunction(client, member, guild, welcomeDM, member);
  } catch (error) {
    console.error('Error in welcomeDmMember function:', error);
  }
}

async function welcomeGuildMember(
  client,
  member,
  guild,
  welcomeGuild,
  guildChannel
) {
  try {
    const sendFunction =
      welcomeGuild.content_type === 'text'
        ? sendTextWelcomeGuildMessage
        : sendEmbedWelcomeGuildMessage;

    await sendFunction(client, member, guild, welcomeGuild, guildChannel);
  } catch (error) {
    console.error('Error in welcomeGuildMember function:', error);
  }
}

async function sendEmbedWelcomeGuildMessage(
  client,
  member,
  guildConfig,
  destination
) {
  try {
    const embedData = generateEmbedData(guildConfig, member);
    if (embedData) {
      await destination.send({ embeds: [embedData] });
    }
  } catch (error) {
    console.error('Error sending embed welcome message:', error);
  }
}

function generateEmbedData(welcomeGuild, member) {
  const embedData = {
    title: replaceWords(welcomeGuild.embed_title, member),
    url: replaceWords(welcomeGuild.embed_url, member),
    description: replaceWords(welcomeGuild.embed_description, member),
    author: {
      name: replaceWords(welcomeGuild.embed_author_name, member),
      url: replaceWords(welcomeGuild.embed_author_url, member),
      icon_url: replaceWords(welcomeGuild.embed_author_icon_url, member),
    },
    thumbnail: {
      url: replaceWords(welcomeGuild.embed_thumbnail_url, member),
    },
    color: welcomeGuild.embed_color
      ? resolveColor(welcomeGuild.embed_color)
      : undefined,
    image: {
      url: replaceWords(welcomeGuild.embed_image_url, member),
    },
    footer: {
      text: replaceWords(welcomeGuild.embed_footer_text, member),
      icon_url: replaceWords(welcomeGuild.embed_footer_icon_url, member),
    },
    timestamp: welcomeGuild.embed_timestamp ? new Date() : undefined,
  };

  return embedData;
}

async function sendTextWelcomeGuildMessage(
  client,
  member,
  guild,
  welcomeGuild,
  destination
) {
  try {
    const messageContent = replaceWords(welcomeGuild.content, member);
    if (!welcomeGuild.card_enabled && !messageContent) return;

    const dataMessage = {
      content: messageContent,
      files: [],
    };

    if (welcomeGuild.card_enabled) {
      const welcomeCard = await generateWelcomeCard(
        client,
        member,
        guild,
        welcomeGuild
      );
      if (welcomeCard) {
        dataMessage.files.push(welcomeCard);
      }
    }

    await destination.send(dataMessage);
  } catch (error) {
    console.error('Error sending text welcome message:', error);
  }
}

async function generateWelcomeCard(client, member, guild, welcomeGuild) {
  try {
    const CreateWelcomeCard = new client.WelcomeCard()
      .setTitle(
        guild?.language === 'pt_BR' ? 'Bem-vindo' : 'Welcome',
        welcomeGuild?.card_title_color
      )
      .setUsername(member?.user?.username, welcomeGuild?.card_username_color)
      .setDescription(
        replaceWords(welcomeGuild?.card_content, member),
        welcomeGuild?.card_content_color
      )
      .setBackground(
        welcomeGuild?.card_background_type,
        welcomeGuild?.card_background_type === 'image'
          ? welcomeGuild?.card_background_url
          : welcomeGuild?.card_background_color
      )
      .setOverlay(welcomeGuild?.card_overlay)
      .setAvatar(
        member.user.displayAvatarURL({ size: 4096, extension: 'jpg' }),
        welcomeGuild?.card_avatar_color
      );

    return await CreateWelcomeCard.createImage();
  } catch (error) {
    console.error('Error generating welcome card:', error);
  }
}

async function assignWelcomeGuildRoles(welcomeGuild, member) {
  try {
    const rolesToAdd = member.user.bot
      ? welcomeGuild.role_bot_ids
      : welcomeGuild.role_ids;
    if (rolesToAdd && rolesToAdd.length > 0) {
      await member.roles.add(rolesToAdd);
    }
  } catch (error) {
    console.error('Error assigning roles:', error);
  }
}

function replaceWords(text, member) {
  return text
    ?.replace(/{user}/gi, member.toString())
    ?.replace(/{avatar}/gi, member.displayAvatarURL({ dynamic: true }))
    ?.replace(/{server}/gi, member.guild.toString())
    ?.replace(/{membercount}/gi, member.guild.memberCount)
    ?.replace(
      /{date}/gi,
      `<t:${Math.round(member.user.createdTimestamp / 1000)}:R>`
    );
}
