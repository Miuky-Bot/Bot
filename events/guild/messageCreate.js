import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
} from 'discord.js';

export default {
  name: Events.MessageCreate,
  once: false,
  async execute(client, message) {
    if (message.mentions.has(client.user) && !message.mentions.everyone) {
      await client.interaction.components(message, true);
      const buttons = message.language.mention.buttons.map(
        (b) =>
          new ButtonBuilder({
            label: b.label,
            style: b?.url ? ButtonStyle.Link : ButtonStyle.Primary,
            customId: b?.customId ? b.customId : null,
            url: b?.url ? b.url : null,
            emoji: b?.emoji ? '✨' : null,
          })
      );
      const row = new ActionRowBuilder().addComponents(buttons);

      return message.reply({
        content: message.language.mention.content,
        components: [row],
      });
    }
  },
};
