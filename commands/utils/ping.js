import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Shows the latency of Miuky!')
    .setDescriptionLocalizations({
      'pt-BR': 'Mostra a latência do Miuky!',
    }),
  cooldown: 5,
  category: 'utils',
  async execute(client, interaction) {
    const start = process.hrtime();
    await checkDatabaseLatency(client, interaction);
    const stop = process.hrtime(start);
    const dbPing = calculateMilliseconds(stop);

    const message = formatPingMessage(client, interaction, dbPing);

    const startMiukyMS = process.hrtime();
    return interaction.reply({ content: message }).then(() => {
      const stopMiukyMS = process.hrtime(startMiukyMS);
      const MiukyMS = calculateMilliseconds(stopMiukyMS);

      setTimeout(() => {
        return interaction.editReply(formatEditedPingMessage(message, MiukyMS));
      }, 1000);
    });
  },
};

function checkDatabaseLatency(client, interaction) {
  return client.prisma.guild.findUnique({
    where: {
      id: interaction?.guildId,
    },
  });
}

function calculateMilliseconds(hrtime) {
  return Math.round((hrtime[0] * 1e9 + hrtime[1]) / 1e6);
}

function formatPingMessage(client, interaction, dbPing) {
  return interaction.language.commands.utils.ping.content
    .replace(
      '{Cluster}',
      `${Number(client.cluster.id + 1)} [${client.cluster.ids.size}]`
    )
    .replace('{dbPing}', dbPing)
    .replace('{clientPing}', Math.round(client.ws.ping));
}

function formatEditedPingMessage(message, MiukyMS) {
  return message.replace('...', MiukyMS);
}
