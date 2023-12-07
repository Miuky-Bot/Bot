import { Events, PermissionsBitField, Collection } from 'discord.js';
import { readdirSync, existsSync } from 'fs';
import { resolve } from 'path';

export class Interaction {
  constructor(client, folders) {
    this.client = client;
    this.folder = folders?.interactions;
    this.loadInteractions();

    client.on(Events.InteractionCreate, async (interaction) => {
      client.webhook.message({
        content: `\`\`\`js\nType: ${interaction.type}\nUserId: ${
          interaction.user.id
        }\nGuildId: ${interaction.guildId || null}\nCommand: ${
          interaction.commandName ||
          interaction.message.interaction.commandName ||
          null
        }\`\`\``,
      });

      if (interaction.isButton()) await this.buttonCreate(interaction);
      if (interaction.isAnySelectMenu())
        await this.selectMenuCreate(interaction);
      if (interaction.isCommand() || interaction.isContextMenuCommand())
        await this.commandCreate(interaction);
    });
  }

  async components(interaction) {
    const database =
      (await this.client.prisma.language.findUnique({
        where: {
          guildId: interaction?.guildId,
        },
      })) || 'en';

    if (
      interaction.guildId === null ||
      interaction.appPermissions.has(
        PermissionsBitField.Flags.UseExternalEmojis
      )
    )
      interaction.emoji = this.client.res.custom;
    else interaction.emoji = this.client.res.unicode;

    return (interaction.language = this.client.res[database?.language || 'en']);
  }

  async buttonCreate(interaction) {
    await this.components(interaction);
    return this.client.emit('buttonCreate', interaction);
  }

  async commandCreate(interaction) {
    await this.components(interaction);
    return this.client.emit('commandCreate', interaction);
  }

  async selectMenuCreate(interaction) {
    await this.components(interaction);
    return this.client.emit('selectMenuCreate', interaction);
  }

  async loadInteractions() {
    if (!existsSync(resolve(this.folder))) return;

    const interactionsDir = resolve(this.folder);
    this.client.interactions = new Collection();

    const dirs = await readdirSync(interactionsDir, {
      withFileTypes: true,
    });
    for (let dir of dirs) {
      if (dir.isDirectory()) {
        const files = await readdirSync(
          `${interactionsDir}/${dir.name}`
        ).filter((file) => file.endsWith('.js'));
        for (let file of files) {
          const { default: interaction } = await import(
            `file:///${interactionsDir}/${dir.name}/${file}`
          );

          if ('execute' in interaction)
            this.client.interactions.set(interaction?.name, interaction);
        }
      } else {
        const { default: interaction } = await import(
          `file:///${interactionsDir}/${dir.name}`
        );

        if ('execute' in interaction)
          this.client.interactions.set(interaction?.name, interaction);
      }
    }
  }
}
