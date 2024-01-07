import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  name: 'mention_action',
  async execute(client, interaction) {
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

    return interaction.followUp({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
