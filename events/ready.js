import { ActivityType, Events } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: false,
  async execute(client) {
    const activities = [
      {
        type: ActivityType.Custom,
        name: `⭐ Cluster ${Number(client.cluster.id + 1)} [${
          client.cluster.ids.size
        }]`,
      },
      {
        type: ActivityType.Custom,
        name: `⭐ /help - https://miuky.xyz`,
      },
    ];

    let currentIndex = 0;
    setInterval(() => {
      const activity = activities[currentIndex];
      client.user.setActivity(activity);

      currentIndex =
        currentIndex >= activities.length - 1 ? 0 : currentIndex + 1;
    }, 30000);
  },
};
