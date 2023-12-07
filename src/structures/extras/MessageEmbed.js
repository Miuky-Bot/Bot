import { EmbedBuilder } from 'discord.js';

export class Embed extends EmbedBuilder {
  constructor(EmbedData = {}) {
    super(EmbedData);
    this.setColor(3092790);
  }
}
