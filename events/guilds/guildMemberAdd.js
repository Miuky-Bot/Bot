import { Events, resolveColor } from 'discord.js';

export default {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(client, member) {
    try {
      const guildId = member?.guild?.id;
      if (!guildId) return;

      const guild = await client.prisma.guild.findUnique({
        where: {
          id: guildId,
        },
        include: {
          welcomeGuild: true,
          welcomeDM: true,
          premium: true,
        },
      });

      const welcomeGuild = guild?.welcomeGuild;
      const guildChannel = client.channels.cache.get(welcomeGuild?.channel_id);
      if (welcomeGuild?.enabled && guildChannel) {
        await welcomeGuildMember(
          client,
          member,
          guild,
          welcomeGuild,
          guildChannel
        );
      }

      const welcomeDM = guild?.welcomeDM;
      if (welcomeDM?.enabled) {
        await welcomeDmMember(client, member, guild, welcomeDM);
      }
    } catch (err) {
      client.webhook.error(err.stack);
    }
  },
};

async function welcomeDmMember(client, member, guild, welcomeDM) {
  if (welcomeDM.content_type === 'text') {
    await sendTextWelcomeGuildMessage(client, member, guild, welcomeDM, member);
  } else if (welcomeDM.content_type === 'embed') {
    await sendEmbedWelcomeGuildMessage(member, welcomeDM, member);
  }
}

async function welcomeGuildMember(
  client,
  member,
  guild,
  welcomeGuild,
  guildChannel
) {
  await assignWelcomeGuildRoles(welcomeGuild, member);

  if (welcomeGuild.content_type === 'text') {
    await sendTextWelcomeGuildMessage(
      client,
      member,
      guild,
      welcomeGuild,
      guildChannel
    );
  } else if (welcomeGuild.content_type === 'embed') {
    await sendEmbedWelcomeGuildMessage(member, welcomeGuild, guildChannel);
  }
}

async function sendEmbedWelcomeGuildMessage(
  member,
  welcomeGuild,
  guildChannel
) {
  const embedData = generateEmbedData(welcomeGuild, member);
  if (embedData) {
    await guildChannel.send({ embeds: [embedData] });
  }
}

function generateEmbedData(welcomeGuild, member) {
  let embedData = {
    thumbnail: {},
    author: {},
    footer: {},
    image: {},
  };

  if (welcomeGuild.embed_title) {
    embedData.title = replaceWords(welcomeGuild.embed_title, member);
  }

  if (welcomeGuild.embed_url) {
    embedData.url = replaceWords(welcomeGuild.embed_url, member);
  }

  if (welcomeGuild.embed_description) {
    embedData.description = replaceWords(
      welcomeGuild.embed_description,
      member
    );
  }

  if (welcomeGuild.embed_author_name) {
    embedData.author.name = replaceWords(
      welcomeGuild.embed_author_name,
      member
    );
  }

  if (welcomeGuild.embed_author_url) {
    embedData.author.url = replaceWords(welcomeGuild.embed_author_url, member);
  }

  if (welcomeGuild.embed_author_icon_url) {
    embedData.author.icon_url = replaceWords(
      welcomeGuild.embed_author_icon_url,
      member
    );
  }

  if (welcomeGuild.embed_thumbnail_url) {
    embedData.thumbnail.url = replaceWords(
      welcomeGuild.embed_thumbnail_url,
      member
    );
  }

  if (welcomeGuild.embed_color) {
    embedData.color = resolveColor(welcomeGuild.embed_color);
  }

  if (welcomeGuild.embed_image_url) {
    embedData.image.url = replaceWords(welcomeGuild.embed_image_url, member);
  }

  if (welcomeGuild.embed_footer_text) {
    embedData.footer.text = replaceWords(
      welcomeGuild.embed_footer_text,
      member
    );
  }

  if (welcomeGuild.embed_footer_icon_url) {
    embedData.footer.icon_url = replaceWords(
      welcomeGuild.embed_footer_icon_url,
      member
    );
  }

  if (welcomeGuild.embed_timestamp) {
    embedData.timestamp = new Date();
  }

  return embedData;
}

async function sendTextWelcomeGuildMessage(
  client,
  member,
  guild,
  welcomeGuild,
  guildChannel
) {
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

  await guildChannel.send(dataMessage);
}

async function generateWelcomeCard(client, member, guild, welcomeGuild) {
  const cardContent = welcomeGuild?.card_content;

  const CreateWelcomeCard = new client.WelcomeCard()
    .setTitle(
      guild?.language === 'pt_BR' ? 'Bem-vindo' : 'Welcome',
      welcomeGuild?.card_title_color
    )
    .setUsername(member?.user?.username, welcomeGuild?.card_username_color)
    .setDescription(
      replaceWords(cardContent, member),
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

  const WelcomeCard = await CreateWelcomeCard.createImage();
  return WelcomeCard;
}

async function assignWelcomeGuildRoles(welcomeGuild, member) {
  if (!welcomeGuild || !welcomeGuild?.role_enabled) return;

  const rolesToAdd = member.user.bot
    ? welcomeGuild.role_bot_ids
    : welcomeGuild.role_ids;
  if (rolesToAdd && rolesToAdd.length > 0) {
    await member.roles.add(rolesToAdd);
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
