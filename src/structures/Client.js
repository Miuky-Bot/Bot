import { ClusterClient, getInfo } from 'discord-hybrid-sharding';
import { Client } from 'discord.js';

import { Handler } from './Handler.js';
import { Webhook } from './Webhook.js';
import { Interaction } from './Interaction.js';
import { WelcomeCard } from './extras/WelcomeCard.js';
import { Embed } from './extras/MessageEmbed.js';

export class Miuky extends Client {
  /**
   * @param {ClientOptions} discordOptions
   */
  constructor({ webhookUrl, discordOptions, folders, plugins }) {
    super({
      shards: getInfo().SHARD_LIST,
      shardCount: getInfo().TOTAL_SHARDS,
      ...discordOptions, // https://discord-intents-calculator.vercel.app/
    });

    this.folders = folders;
    this.plugins = plugins;

    this.cluster = new ClusterClient(this);

    this.WelcomeCard = WelcomeCard;
    this.Embed = Embed;
    this.handler = new Handler(this.folders, this);
    this.webhook = new Webhook(webhookUrl);
    new Interaction(this, this.folders);
  }

  /**
   *
   * @param {String} message
   * @returns {Event}
   */
  debug(message) {
    return this.emit(
      'Miuky',
      `[${new Date().toLocaleTimeString()}] ${message}`
    );
  }

  /**
   *
   * @returns {DiscordBotConnect}
   */
  async connect() {
    console.log(
      `────────────────────────────[Cluster ${Number(
        this.cluster.id + 1
      )}]────────────────────────────`
    );

    if (this.folders) await this.handler.init();

    return this.login().then(() => {
      console.log(
        '───────────────────────────────────────────────────────────────────'
      );
      console.log(
        ` Cluster: ${Number(this.cluster.id + 1)} | Shards: ${
          this.cluster.ids.size
        } | Servers: ${this.guilds.cache.size} | Users: ${
          this.users.cache.size
        }`
      );
      console.log(` Tag: ${this.user.tag} | Id: ${this.user.id}`);
      return console.log(
        '───────────────────────────────────────────────────────────────────'
      );
    });
  }
}
