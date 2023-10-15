import { WebhookClient } from 'discord.js';

export class Webhook extends WebhookClient {
  constructor(url) {
    if (!url) return;
    super({ url });
  }

  message(data) {
    if (!data) return;
    return this.send(data);
  }

  error(data) {
    if (!data) return;

    return this.send({
      embeds: [
        {
          description: `\`\`\`js\n${data}\`\`\``,
          color: 3092790,
          timestamp: new Date(),
        },
      ],
    });
  }
}
