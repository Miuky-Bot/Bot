import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { inspect } from 'util';

export default {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluate JavaScript code')
    .addStringOption((option) =>
      option.setName('code').setDescription('JavaScript code to evaluate')
    ),
  isDevOnly: true,
  category: 'utils',
  async execute(client, interaction) {
    if (interaction.user.id !== process.env.DEVELOPER) return;
    const code = interaction.options.getString('code');

    if (!code) {
      return interaction.reply({
        content: '❌ Please provide JavaScript code to evaluate.',
        ephemeral: true,
      });
    }

    try {
      const start = process.hrtime();
      let result = await eval(`(async () => { return ${code} })()`);
      let evaluated = inspect(result, { depth: 0 });
      const end = process.hrtime(start);

      if (evaluated.length > 1950) {
        return interaction.reply({
          content: '❌ Evaluation result is too long to display.',
          ephemeral: true,
        });
      }

      const executionTime = `${(end[0] + end[1] / 1e9).toFixed(3)}s`;
      const embed = new EmbedBuilder()
        .setTitle('Eval Result')
        .setDescription(`\`\`\`javascript\n${evaluated}\n\`\`\``)
        .setFooter({ text: `Execution Time: ${executionTime}` });

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: `❌ An error occurred: \`${error.message}\``,
        ephemeral: true,
      });
    }
  },
};
